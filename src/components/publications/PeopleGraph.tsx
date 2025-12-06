'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ChartBarSquareIcon,
} from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { PublicationPageConfig } from '@/types/page';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const NoSSRForceGraph = dynamic(() => import('@/lib/NoSSRGraph'), {
    ssr: false
});

interface CoAuthorNode {
    id: string;
    group: string;
    publicationsCount: number;
    isHighlighted: boolean;
    r: number;
}

interface CoAuthorLink {
    source: string;
    target: string;
    weight: number;
    publications: Publication[];
}

interface PeopleGraphProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
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

    const MAX_NODE_RADIUS = 8;
    const MIN_NODE_RADIUS = 2;
    const maxPublications = Math.max(1, ...Array.from(authorMap.values()).map(p => p.publicationsCount));
    const scalingFactor = (MAX_NODE_RADIUS - MIN_NODE_RADIUS) / (maxPublications - 1 || 1);

    const coAuthorNodes: CoAuthorNode[] = Array.from(authorMap.values()).map(p => ({
        id: p.name,
        group: p.affiliation || 'Unknown',
        publicationsCount: p.publicationsCount,
        isHighlighted: p.isHighlighted,
        r: MIN_NODE_RADIUS + (p.publicationsCount - 1) * scalingFactor,
    }));

    const coAuthorLinks: CoAuthorLink[] = Array.from(linkMap.entries()).map(([key, data]) => {
        const [source, target] = key.split('---');
        return {
            source,
            target,
            weight: data.weight,
            publications: data.publications,
        };
    });

    return { coAuthorNodes, coAuthorLinks };
}

function processPublicationsForForceGraph(publications: Publication[]): {
    nodes: CoAuthorNode[];
    links: CoAuthorLink[];
} {
    const { coAuthorNodes, coAuthorLinks } = processPublications(publications);
    return { nodes: coAuthorNodes, links: coAuthorLinks };
}

interface ForceNetworkGraphProps {
    data: {
        nodes: CoAuthorNode[];
        links: CoAuthorLink[];
    };
    width: number,
    height: number,
}

function ForceNetworkGraph({ data, width, height }: ForceNetworkGraphProps) {
    return (
        <NoSSRForceGraph
            graphData={data}
            height={height}
            width={width}
            nodeId='id'
            nodeAutoColorBy="group"
            nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.name || node.id;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sedan SC`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = "black";
                ctx.fillText(label, node.x as number, node.y as number);
            }
            }
            nodeColor={node => node.isHighlighted ? "#B7410E" : '#66a5ed'}
            nodeCanvasObjectMode={() => 'after'}
            nodeVal={node => node.r}
            nodeRelSize={4}
            linkColor={"#607d8b"}
            linkCurvature={0.1}
            linkWidth={1.2}
            linkHoverPrecision={5}
            backgroundColor="transparent"
            d3AlphaDecay={0.01}
            d3VelocityDecay={0.3}
            warmupTicks={50}
            cooldownTicks={300}
            enableZoomInteraction
            enableNodeDrag
            enablePanInteraction
        />
    );
}

export default function PeopleGraph({ config, publications, embedded = false }: PeopleGraphProps) {

    const containerRef = useRef(null);

    const [dimensions, setDimensions] = useState<[number, number]>([0, 0]);

    const graphData = useMemo(() => {
        if (!publications || publications.length === 0) {
            return { nodes: [], links: [] };
        }
        return processPublicationsForForceGraph(publications);
    }, [publications]);

    useEffect(() => {
        if (containerRef.current) {
            const observer = new ResizeObserver((entries) => {
                const { width, height } = entries[0].contentRect;
                setDimensions([width, height]);
            });
            observer.observe(containerRef.current);
            return () => observer.disconnect();
        }
    }, [])


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
            <div ref={containerRef} className={cn(
                "w-full bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-4 font-sans",
                embedded ? "h-[400px]" : "h-[70vh] min-h-[550px]"
            )}>
                {containerRef.current && dimensions[0] > 0 && dimensions[1] > 0 && graphData.nodes.length > 0 ? (
                    <ForceNetworkGraph
                        data={graphData}
                        width={dimensions[0]}
                        height={dimensions[1]}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-lg">
                        <ChartBarSquareIcon className="w-12 h-12 mb-3 text-gray-400" />
                        <p>None</p>
                    </div>
                )}
            </div>
        </motion.div>

    );
}
