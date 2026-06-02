interface VLibrasWidget {
  new(url: string): void;
}

interface Window {
  VLibras: {
    Widget: VLibrasWidget;
  };
}
