"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches `useGLTF`/`useTexture` suspense-rejections when
 * /models/suit/suit_base.glb (or its fabric textures) don't exist yet, and
 * renders PlaceholderSuit instead. There's no hook equivalent for catching
 * render errors, hence the class component.
 */
export class ModelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn(
      "[SuitViewer] Falling back to the placeholder model — suit_base.glb or its fabric textures aren't in public/ yet.",
      error,
    );
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
