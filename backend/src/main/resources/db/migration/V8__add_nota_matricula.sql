ALTER TABLE matriculas ADD COLUMN nota DECIMAL(4,2);
ALTER TABLE matriculas ADD COLUMN aprovado BOOLEAN DEFAULT FALSE;
ALTER TABLE matriculas ADD COLUMN nota_lancada_em TIMESTAMP;
ALTER TABLE matriculas ADD COLUMN nota_lancada_por BIGINT REFERENCES usuarios(id);
