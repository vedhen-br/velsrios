import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Optional: send to monitoring
    // console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial', color: '#111' }}>
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>Ocorreu um erro na aplicação</h1>
          <p style={{ marginBottom: 16 }}>Atualize a página. Se persistir, verifique as variáveis de ambiente ou entre em contato com o suporte.</p>
          <pre style={{ background: '#f8f8f8', padding: 12, borderRadius: 8, overflow: 'auto' }}>
            {String(this.state.error)}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
