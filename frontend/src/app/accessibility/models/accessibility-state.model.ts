export interface AccessibilityState {
  fontLevel:       number; // -1 | 0 | 1 | 2 | 3
  dislexia:        boolean;
  linha:           'normal' | 'media' | 'ampla';
  letra:           'normal' | 'media' | 'ampla';
  contraste:       'normal' | 'alto' | 'invertido';
  saturacao:       'normal' | 'cinza' | 'sepia';
  daltonismo:      'normal' | 'protan' | 'deuter' | 'tritan';
  cursor:          'normal' | 'grande';
  lupa:            boolean;
  linksDestacados: boolean;
  mascara:         boolean;
  guia:            boolean;
}

export const DEFAULT_STATE: AccessibilityState = {
  fontLevel:       0,
  dislexia:        false,
  linha:           'normal',
  letra:           'normal',
  contraste:       'normal',
  saturacao:       'normal',
  daltonismo:      'normal',
  cursor:          'normal',
  lupa:            false,
  linksDestacados: false,
  mascara:         false,
  guia:            false,
};
