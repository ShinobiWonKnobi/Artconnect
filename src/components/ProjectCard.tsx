import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    link: string;
    tags: string[];
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={project.image_url}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{project.title}</h3>
            <ExternalLink className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-sm text-gray-200 mb-2">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-white/20 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.a>
  );
}