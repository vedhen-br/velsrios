import React from 'react';
import { getApiUrl, getWebSocketUrl, isCodespaces, isVercel } from '../utils/env';

export default function DebugBar() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const enabled = params.get('debug') === '1';
  if (!enabled) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 10, left: 10, zIndex: 9999,
      background: 'rgba(17,24,39,0.9)', color: '#fff', padding: '8px 12px', borderRadius: 8,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
    }}>
      <div>env: {isVercel() ? 'vercel' : isCodespaces() ? 'codespaces' : 'local'}</div>
      <div>apiUrl: {getApiUrl()}</div>
      <div>wsUrl: {getWebSocketUrl()}</div>
      <div>host: {typeof window !== 'undefined' ? window.location.hostname : 'n/a'}</div>
    </div>
  );
}
