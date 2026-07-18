import { useEffect } from 'react';

export default function useSEO(title, description) {
  useEffect(() => {
    // Update Document Title
    document.title = `${title} | Dexterity Learn`;
    
    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      metaDesc.content = description;
      document.head.appendChild(metaDesc);
    }
  }, [title, description]);
}
