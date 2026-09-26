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
  const initializedRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || initializedRef.current) return;

    initializedRef.current = true;

    // Pass prompt dari HomeApp → React → legacy workspace.
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