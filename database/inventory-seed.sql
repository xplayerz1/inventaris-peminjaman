-- Seed Data for inventory_db

\c inventory_db;

-- Items
INSERT INTO items (name, code, category, total_quantity, available_quantity, location, condition_status, description) VALUES
('Laptop HP Pavilion', 'LPT001', 'Elektronik', 5, 5, 'Ruang Server', 'BAIK', 'Laptop untuk mahasiswa'),
('Proyektor Epson', 'PRJ001', 'Elektronik', 3, 3, 'Gudang Lantai 2', 'BAIK', 'Proyektor untuk presentasi'),
('Whiteboard 2x1m', 'WBD001', 'ATK', 8, 8, 'Ruang Rapat', 'BAIK', 'Whiteboard magnetic'),
('Kamera Canon EOS', 'CAM001', 'Elektronik', 2, 2, 'Studio Foto', 'BAIK', 'Kamera DSLR untuk dokumentasi'),
('Speaker JBL', 'SPK001', 'Elektronik', 4, 4, 'Gudang Lantai 1', 'BAIK', 'Speaker portable');

-- Conversations (will be created when users start chatting)
-- Messages (empty initially)
