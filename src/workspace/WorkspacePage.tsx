import { useEffect, useRef } from 'react';
import { workspaceMarkup } from './workspaceMarkup';
import { initWorkspace } from './legacyWorkspace';
import './workspace.css';

interface WorkspacePageProps {
  initialPrompt?: string;
}

export default function WorkspacePage({
  initialPrompt = '',
}: WorkspacePageProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Reset markup to clean state before initializing
    root.innerHTML = workspaceMarkup;

    initWorkspace(root, {
      initialPrompt: initialPrompt.trim(),
    });

    return undefined;
  }, [initialPrompt]);

  return (
    <div className="x0a-workspace-host">
      <div
        ref={rootRef}
        className="x0a-workspace-root"
        dangerouslySetInnerHTML={{
          __html: workspaceMarkup,
        }}
      />
    </div>
  );
}