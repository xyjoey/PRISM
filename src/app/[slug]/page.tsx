import { notFound } from 'next/navigation';
import { getPageConfig, getMarkdownContent, getBibtexContent } from '@/lib/content';
import { getConfig } from '@/lib/config';
import { parseBibTeX } from '@/lib/bibtexParser';
import PublicationsList from '@/components/publications/PublicationsList';
import PeopleGraph from '@/components/publications/PeopleGraph';
import TextPage from '@/components/pages/TextPage';
import CardPage from '@/components/pages/CardPage';
import {
    BasePageConfig,
    PublicationPageConfig,
    TextPageConfig,
    CardPageConfig
} from '@/types/page';

import { Metadata } from 'next';

export function generateStaticParams() {
    const config = getConfig();
    return config.navigation
        .filter(nav => nav.type === 'page' && nav.target !== 'about') // 'about' is handled by root page
        .map(nav => ({
            slug: nav.target,
        }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const pageConfig = getPageConfig(slug) as BasePageConfig | null;

    if (!pageConfig) {
        return {};
    }

    return {
        title: pageConfig.title,
        description: pageConfig.description,
    };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const pageConfig = getPageConfig(slug) as BasePageConfig | null;

    if (!pageConfig) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {pageConfig.type === 'publication' && (
                <PublicationPage config={pageConfig as PublicationPageConfig} />
            )}
            {pageConfig.type === 'people' && (
                <PeoplePage config={pageConfig as PublicationPageConfig} />
            )}
            {pageConfig.type === 'text' && (
                <TextPageWrapper config={pageConfig as TextPageConfig} />
            )}
            {pageConfig.type === 'card' && (
                <CardPage config={pageConfig as CardPageConfig} />
            )}
        </div>
    );
}

function PeoplePage({ config }: { config: PublicationPageConfig }) {
    const bibtex = getBibtexContent(config.source);
    const publications = parseBibTeX(bibtex);
    return <PeopleGraph config={config} publications={publications} />;
}

function PublicationPage({ config }: { config: PublicationPageConfig }) {
    const bibtex = getBibtexContent(config.source);
    const publications = parseBibTeX(bibtex);
    return <PublicationsList config={config} publications={publications} />;
}

function TextPageWrapper({ config }: { config: TextPageConfig }) {
    const content = getMarkdownContent(config.source);
    return <TextPage config={config} content={content} />;
}
