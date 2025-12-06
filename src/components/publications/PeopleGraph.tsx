'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChartBarSquareIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { PublicationPageConfig } from '@/types/page';
import { cn } from '@/lib/utils';
import Graph from "react-vis-network-graph";

interface CopyHintProps {
    isCopied: boolean;
    message?: string;
}

interface CoAuthorNode {
    id: string;
    name: string;
    group: string;
    publicationsCount: number;
    isHighlighted: boolean;
}

interface CoAuthorLink {
    source: string;
    target: string;
    weight: number;
    publications: Publication[];
}

interface VisNodeColor {
    border: string;
    background: string;
    highlight: {
        border: string;
        background: string;
    };
    hover?: {
        border: string;
        background: string;
    };
}

interface VisNode {
    id: string;
    label: string;
    value: number;
    group: string;
    title: string;
    borderWidth: number;
    color?: string | VisNodeColor;
    shape: 'dot' | 'circle';
}

interface VisEdge {
    id: string;
    from: string;
    to: string;
    value: number;
    title: string;
    font: { multi: true };
}

interface PeopleGraphProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
}

export default function PeopleGraph({ config, publications, embedded = false }: PeopleGraphProps) {

    const [isMounted, setIsMounted] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const showCopyHint = useCallback(() => {
        setIsCopied(true);
        const timer = setTimeout(() => {
            setIsCopied(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleEdgeClicked = useCallback((
        edgeData: VisEdge | null,
        position: { x: number, y: number } | null
    ) => {
        if (edgeData && edgeData.title) {
            const contentToCopy = edgeData.title.replace(/<br>/g, '\n').replace(/<hr>/g, '—');

            navigator.clipboard.writeText(contentToCopy)
                .then(() => {
                    showCopyHint();
                })
                .catch(err => {

                });
        }
    }, [showCopyHint]);

    const { visNodes, visEdges, highlightedAuthor } = useMemo(() => {
        if (!publications || publications.length === 0) {
            return { visNodes: [], visEdges: [], highlightedAuthor: null };
        }
        return processPublicationsForVis(publications);
    }, [publications]);

    const graphData = useMemo(() => ({
        nodes: visNodes,
        edges: visEdges,
    }), [visNodes, visEdges]);

    if (!isMounted) {
        return (
            <div className={cn(
                "w-full",
                embedded ? "max-w-none h-[400px]" : "max-w-6xl mx-auto py-8 h-[70vh] min-h-[550px]"
            )}>
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                <div className={cn(
                    "bg-neutral-100 dark:bg-neutral-800 rounded-xl shadow-inner animate-pulse",
                    embedded ? "h-[calc(100%-60px)]" : "h-[calc(100%-80px)]"
                )}>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={cn("w-full", embedded ? "max-w-none" : "max-w-6xl mx-auto")}
        >
            <div className={"mb-4"}>
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <p className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl`}>
                        {config.description}
                    </p>
                )}
            </div>
            <div className={cn(
                "w-full bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-4 font-sans",
                embedded ? "h-[400px]" : "h-[70vh] min-h-[550px]"
            )}>
                {visNodes.length > 0 ? (
                    <VisNetworkGraph
                        data={graphData}
                        onEdgeClicked={handleEdgeClicked}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-lg">
                        <ChartBarSquareIcon className="w-12 h-12 mb-3 text-gray-400" />
                        <p>None</p>
                    </div>
                )}
            </div>
            <CopyHint isCopied={isCopied} />
        </motion.div>

    );

}

function processPublications(publications: Publication[]): {
    coAuthorNodes: CoAuthorNode[];
    coAuthorLinks: CoAuthorLink[];
} {
    const authorMap: Map<string, {
        name: string;
        affiliation?: string;
        publicationsCount: number;
        isHighlighted: boolean;
    }> = new Map();
    const linkMap: Map<string, { weight: number, publications: Publication[] }> = new Map();
    for (const pub of publications) {
        const authorNames = pub.authors.map(a => a.name);
        for (const author of pub.authors) {
            const name = author.name;
            const current = authorMap.get(name) || {
                name: name,
                affiliation: author.affiliation,
                publicationsCount: 0,
                isHighlighted: false,
            };
            current.publicationsCount++;
            if (author.isHighlighted) {
                current.isHighlighted = true;
            }
            authorMap.set(name, current);
        }

        for (let i = 0; i < authorNames.length; i++) {
            for (let j = i + 1; j < authorNames.length; j++) {
                const authorA = authorNames[i];
                const authorB = authorNames[j];
                const linkKey = authorA < authorB ? `${authorA}---${authorB}` : `${authorB}---${authorA}`;

                const currentLink = linkMap.get(linkKey) || { weight: 0, publications: [] };
                currentLink.weight++;
                currentLink.publications.push(pub);
                linkMap.set(linkKey, currentLink);
            }
        }
    }

    const coAuthorNodes: CoAuthorNode[] = Array.from(authorMap.values()).map(p => ({
        id: p.name,
        name: p.name,
        group: p.affiliation || 'Unknown',
        publicationsCount: p.publicationsCount,
        isHighlighted: p.isHighlighted,
    }));

    const coAuthorLinks: CoAuthorLink[] = Array.from(linkMap.entries()).map(([key, data]) => {
        const [source, target] = key.split('---');
        return { source, target, weight: data.weight, publications: data.publications };
    });

    return { coAuthorNodes, coAuthorLinks };
}

function processPublicationsForVis(publications: Publication[]): {
    visNodes: VisNode[];
    visEdges: VisEdge[];
    highlightedAuthor: CoAuthorNode | null;
} {
    const { coAuthorNodes, coAuthorLinks } = processPublications(publications);

    const highlightedAuthor = coAuthorNodes.find(n => n.isHighlighted) || null;

    const HIGHLIGHT_BORDER_COLOR = '#B7410E';
    const HIGHLIGHT_BACKGROUND_COLOR = '#F9F5EA';

    const visNodes: VisNode[] = coAuthorNodes.map(n => ({
        id: n.id,
        label: n.name,
        value: n.publicationsCount,
        group: n.group,
        title: `Author: ${n.name}<br>Paper: ${n.publicationsCount}<br>Affiliation: ${n.group}`,
        shape: 'dot',
        borderWidth: n.isHighlighted ? 4 : 1,

        color: n.isHighlighted
            ? {
                border: HIGHLIGHT_BORDER_COLOR,
                background: HIGHLIGHT_BACKGROUND_COLOR,
                highlight: {
                    border: HIGHLIGHT_BORDER_COLOR,
                    background: HIGHLIGHT_BACKGROUND_COLOR
                }
            } as VisNodeColor
            : undefined,
    }));


    const visEdges: VisEdge[] = coAuthorLinks.map(l => ({
        id: `${l.source}-${l.target}`,
        from: l.source,
        to: l.target,
        value: l.weight,
        title: `Paper Numbers: ${l.weight}<hr>${l.publications.slice(0, 5).map(p => `- ${p.title} (${p.year})`).join('<br>')}`,
        font: { multi: true },
    }));

    return { visNodes, visEdges, highlightedAuthor };
}

interface VisNetworkGraphProps {
    data: {
        nodes: VisNode[];
        edges: VisEdge[];
    };
    onEdgeClicked: (edgeData: VisEdge | null, position: { x: number, y: number } | null) => void;
}

function VisNetworkGraph({ data, onEdgeClicked }: VisNetworkGraphProps) {
    const graphRef = useRef<any>(null);
    const THEME_COLOR = '#607d8b';
    const LINK_BASE_COLOR = '#C2C2C2';

    const options = useMemo(() => ({
        layout: {
            randomSeed: 42,
            improvedLayout: true,
        },
        physics: {
            enabled: true,
            barnesHut: {
                gravitationalConstant: -2000,
                centralGravity: 0.8,
                springLength: 20,
                springConstant: 0.001,
            },
            minVelocity: 0.75,
            solver: 'barnesHut'
        },
        nodes: {
            scaling: {
                min: 10,
                max: 15,
                label: {
                    enabled: true,
                    min: 14,
                    max: 18,
                }
            },
            font: {
                size: 16,
                face: "Sedan SC",
                color: '#333333'
            },
        },
        edges: {
            smooth: {
                enabled: true,
                type: 'dynamic',
            },
            scaling: {
                min: 0.5,
                max: 5,
            },
            width: 1,
            arrows: {
                to: false,
                from: false,
            },
            color: {
                color: LINK_BASE_COLOR,
                highlight: THEME_COLOR,
                hover: THEME_COLOR,
            }
        },
        interaction: {
            dragNodes: true,
            zoomView: true,
            hover: true,
            tooltipDelay: 100,
        },
    }), []);


    const events = {
        selectEdge: (params: any) => {
            if (params.edges.length === 1) {
                const edgeId = params.edges[0];
                const clickedEdge = data.edges.find(e => e.id === edgeId);
                onEdgeClicked(clickedEdge || null, null);
                if (graphRef.current) {
                    graphRef.current.unselectAll();
                }
            }
        },
        click: (params: any) => {
            // 清理选择
            if (params.edges.length === 0 && graphRef.current) {
                graphRef.current.unselectAll();
            }
        }
    };

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <Graph
                graph={data}
                options={options}
                events={events}
                get={'network'}
            />
        </div>
    );
}

const CopyHint: React.FC<CopyHintProps> = ({
    isCopied,
    message = 'Copied!'
}) => {
    return (
        <AnimatePresence>
            {isCopied && (
                <motion.div
                    className="fixed bottom-8 left-1/2 p-3 bg-gray-800 dark:bg-neutral-100 text-white dark:text-gray-900 rounded-lg shadow-2xl z-[1000] flex items-center space-x-2 pointer-events-none"

                    initial={{ y: 50, opacity: 0, x: '-50%' }}
                    animate={{ y: 0, opacity: 1, x: '-50%' }}
                    exit={{ y: 50, opacity: 0, x: '-50%' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <CheckCircleIcon className="w-5 h-5 text-green-400 dark:text-green-600" />
                    <span className="text-sm font-medium">{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
