-- Corrige slugs gerados incorretamente pela V13 por erro de mapeamento no TRANSLATE
UPDATE unidades SET slug = 'aclimacao'                                        WHERE slug = 'aclimauao';
UPDATE unidades SET slug = 'aracatuba'                                        WHERE slug = 'arauatuba';
UPDATE unidades SET slug = 'centro-universitario-senac---aguas-de-sao-pedro'  WHERE slug = 'centro-universitario-senac---uguas-de-sao-pedro';
UPDATE unidades SET slug = 'jau'                                              WHERE slug = 'jao';
UPDATE unidades SET slug = 'jundiai'                                          WHERE slug = 'jundiae';
UPDATE unidades SET slug = 'marilia'                                          WHERE slug = 'marelia';
UPDATE unidades SET slug = 'mogi-guacu'                                       WHERE slug = 'mogi-guauu';
UPDATE unidades SET slug = 'nacoes-unidas'                                    WHERE slug = 'nauoes-unidas';
UPDATE unidades SET slug = 'santo-andre'                                      WHERE slug = 'santo-andra';
UPDATE unidades SET slug = 'sao-jose-do-rio-preto'                           WHERE slug = 'sao-josa-do-rio-preto';
UPDATE unidades SET slug = 'sao-jose-dos-campos'                              WHERE slug = 'sao-josa-dos-campos';
UPDATE unidades SET slug = 'tatuape-cel-luis-americano'                       WHERE slug = 'tatuapa-cel-lues-americano';
UPDATE unidades SET slug = 'tatuape-serra-de-braganca'                        WHERE slug = 'tatuapa-serra-de-braganua';
UPDATE unidades SET slug = 'taubate'                                          WHERE slug = 'taubata';
