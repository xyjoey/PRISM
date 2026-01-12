import fs from 'fs';
import path from 'path';
import { parse } from 'smol-toml';

export interface SiteConfig {
    site: {
        title: string;
        description: string;
        favicon: string;
    };
    author: {
        name: string;
        title: string;
        institution: string;
        avatar: string;
    };
    social: {
        email?: string;
        location?: string;
        location_url?: string;
        location_details?: string[];
        google_scholar?: string;
        orcid?: string;
        github?: string;
        linkedin?: string;
        [key: string]: string | string[] | undefined;
    };
    features: {
        enable_likes: boolean;
        enable_one_page_mode?: boolean;
    };
    navigation: Array<{
        title: string;
        type: 'section' | 'page' | 'link';
        target: string;
        href: string;
    }>;
    sections: Array<{
        id: string;
        type: 'markdown' | 'publications' | 'list' | 'cards';
        source?: string;
        title?: string;
        filter?: string;
        limit?: number;
    }>;
}

const CONFIG_PATH = path.join(process.cwd(), 'content', 'config.toml');

export function getConfig(): SiteConfig {
    try {
        const fileContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
        const config = parse(fileContent) as unknown as SiteConfig;
        return config;
    } catch (error) {
        console.error('Error loading config:', error);
        // Return a default config or throw
        throw new Error('Failed to load content/config.toml');
    }
}
