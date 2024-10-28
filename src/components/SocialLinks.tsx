import { Github, Twitter, Linkedin, ExternalLink } from 'lucide-react';

interface SocialLinksProps {
  links: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export default function SocialLinks({ links }: SocialLinksProps) {
  const socialIcons = {
    github: Github,
    twitter: Twitter,
    linkedin: Linkedin,
    website: ExternalLink,
  };

  return (
    <div className="flex justify-center space-x-4">
      {(Object.entries(links) as [keyof typeof socialIcons, string][]).map(([platform, url]) => {
        if (!url) return null;
        
        const Icon = socialIcons[platform];
        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-blue-500 
                     dark:hover:text-blue-400 transition-colors duration-200"
            aria-label={`Visit ${platform} profile`}
          >
            <Icon className="w-6 h-6" />
          </a>
        );
      })}
    </div>
  );
}