-- ============================================================
-- CSA Platform — Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- UNIVERSITIES (48 total)
-- ============================================================
INSERT INTO universities (name_en, name_kh, abbreviation, is_public) VALUES
-- Public Universities
('Royal University of Phnom Penh', 'សាកលវិទ្យាល័យភ្នំពេញ', 'RUPP', true),
('Institute of Technology of Cambodia', 'វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា', 'ITC', true),
('National University of Management', 'សាកលវិទ្យាល័យជាតិគ្រប់គ្រង', 'NUM', true),
('Royal University of Law and Economics', 'សាកលវិទ្យាល័យនីតិ-សេដ្ឋកិច្ច', 'RULE', true),
('University of Health Sciences', 'សាកលវិទ្យាល័យវិទ្យាសាស្ត្រសុខាភិបាល', 'UHS', true),
('Royal University of Agriculture', 'សាកលវិទ្យាល័យភូមិន្ទកសិកម្ម', 'RUA', true),
('Royal University of Fine Arts', 'សាកលវិទ្យាល័យភូមិន្ទវិចិត្រសិល្បៈ', 'RUFA', true),
('National Polytechnic Institute of Cambodia', 'វិទ្យាស្ថានជាតិប៉ូលីតិចនិករម្ពុជា', 'NPIC', true),
('National University of Battambang', 'សាកលវិទ្យាល័យជាតិបាត់ដំបង', 'NUBB', true),
('Mean Chey University', 'សាកលវិទ្យាល័យមានជ័យ', 'MCU', true),
('Svay Rieng University', 'សាកលវិទ្យាល័យស្វាយរៀង', 'SRU', true),
('Chea Sim University of Kamchaymear', 'សាកលវិទ្យាល័យជាស៊ីម កំចាយមារ', 'CSUKM', true),
('Cambodia Academy of Digital Technology', 'វិទ្យាស្ថានឌីជីថលកម្ពុជា', 'CADT', true),
('National Institute of Education', 'វិទ្យាស្ថានជាតិអប់រំ', 'NIE', true),
('National Institute of Business', 'វិទ្យាស្ថានជាតិពាណិជ្ជកម្ម', 'NIB', true),
('National Institute of Posts, Telecommunications and ICT', 'វិទ្យាស្ថានជាតិប្រៃសណីយ៍', 'PNIA', true),
('National Institute of Statistics', 'វិទ្យាស្ថានជាតិស្ថិតិ', 'NISA', true),
('Siem Reap Buddhist University', 'សាកលវិទ្យាល័យព្រះពុទ្ធសាសនា សៀមរាប', 'SBU', true),
('Kampong Cham University', 'សាកலវិទ្យាល័យកំពង់ចាម', 'KCU', true),
('University of South-East Asia', 'សាកលវិទ្យាល័យអាស៊ីអាគ្នេយ៍', 'USEA', true),
-- Private Universities
('American University of Phnom Penh', 'សាកលវិទ្យាល័យអាមេរិក នៃក្រុងភ្នំពេញ', 'AUPP', false),
('Paññāsāstra University of Cambodia', 'សាកលវិទ្យាល័យបញ្ញាសាស្ត្រ', 'PUC', false),
('Build Bright University', 'សាកលវិទ្យាល័យ Build Bright', 'BBU', false),
('Cambodia University for Specialties', 'សាកលវិទ្យាល័យកម្ពុជាសម្រាប់ជំនាញ', 'CUS', false),
('CamEd Business School', 'CamEd Business School', 'CAMED', false),
('Cambodian University for Specialties', 'សាកលវិទ្យាល័យជំនាញ', 'CUS2', false),
('Cambodian Mekong University', 'សាកលវិទ្យាល័យមេគង្គ', 'CMU', false),
('City University of Cambodia', 'City University of Cambodia', 'CUC', false),
('Eastern University Cambodia', 'Eastern University Cambodia', 'EUC', false),
('Indochina International University', 'Indochina International University', 'IIU', false),
('International University Cambodia', 'International University Cambodia', 'IUC', false),
('Limkokwing University Malaysia Cambodia', 'Limkokwing University', 'LUC', false),
('Management and Science University Cambodia', 'Management and Science University', 'MSU', false),
('Norton University', 'Norton University', 'NU', false),
('Paragon International University', 'Paragon International University', 'PIU', false),
('PNC University', 'PNC University', 'PNC', false),
('Regent International University', 'Regent International University', 'RIU', false),
('Sena Chey University', 'Sena Chey University', 'SCU', false),
('Southeast Asian University', 'Southeast Asian University', 'SAU', false),
('University of Cambodia', 'University of Cambodia', 'UC', false),
('Western University Cambodia', 'Western University', 'WUC', false),
('Zaman University', 'Zaman University', 'ZU', false),
('National University of Sihanoukville', 'សាកលវិទ្យាល័យជាតិព្រះសីហនុ', 'NUS', true),
('Koh Kong University', 'សាកលវិទ្យាល័យកោះកុង', 'KKU', true),
('Takeo University', 'សាកលវិទ្យាល័យតាកែវ', 'TU', true),
('Preah Vihear University', 'សាកលវិទ្យាល័យព្រះវិហារ', 'PVU', true),
('Prey Veng University', 'សាកលវិទ្យាល័យព្រៃវែង', 'PYU', true),
('Stung Treng University', 'សាកលវិទ្យាល័យស្ទឹងត្រែង', 'STU', true)
ON CONFLICT (abbreviation) DO NOTHING;

-- ============================================================
-- DEPARTMENTS
-- ============================================================

-- RUPP
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Computer Science', 'វិទ្យាសាស្ត្រកុំព្យូទ័រ'),
    ('Mathematics', 'គណិតវិទ្យា'),
    ('Physics', 'រូបវិទ្យា'),
    ('Chemistry', 'គីមីវិទ្យា'),
    ('Biology', 'ជីវវិទ្យា'),
    ('Literature', 'អក្សរសាស្ត្រ'),
    ('History', 'ប្រវត្តិសាស្ត្រ'),
    ('Law', 'ច្បាប់'),
    ('Economics', 'សេដ្ឋកិច្ច'),
    ('Geography', 'ភូមិវិទ្យា'),
    ('Psychology', 'ចិត្តវិទ្យា'),
    ('Media & Communication', 'ព័ត៌មានវិទ្យា'),
    ('Sociology', 'សង្គមវិទ្យា')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'RUPP'
ON CONFLICT DO NOTHING;

-- ITC
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Civil Engineering', 'វិស្វកម្មស៊ីវិល'),
    ('Electrical Engineering', 'វិស្វកម្មអគ្គិសនី'),
    ('Computer Engineering', 'វិស្វកម្មកុំព្យូទ័រ'),
    ('Chemical Engineering', 'វិស្វកម្មគីមី'),
    ('Mechanical Engineering', 'វិស្វកម្មមេកានិច'),
    ('Information Technology', 'បច្ចេកវិទ្យាព័ត៌មាន')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'ITC'
ON CONFLICT DO NOTHING;

-- NUM
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Business Administration', 'គ្រប់គ្រងពាណិជ្ជកម្ម'),
    ('Accounting', 'គណនេយ្យ'),
    ('Finance & Banking', 'ហិរញ្ញវត្ថុ និងធនាគារ'),
    ('Management', 'គ្រប់គ្រង'),
    ('Marketing', 'ទីផ្សារ'),
    ('Tourism', 'វិស័យទេសចរណ៍')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'NUM'
ON CONFLICT DO NOTHING;

-- RULE
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Law', 'ច្បាប់'),
    ('Economics', 'សេដ្ឋកិច្ច'),
    ('International Relations', 'ទំនាក់ទំនងអន្តរជាតិ'),
    ('Management', 'គ្រប់គ្រង')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'RULE'
ON CONFLICT DO NOTHING;

-- UHS
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Medicine', 'វេជ្ជសាស្ត្រ'),
    ('Pharmacy', 'ឱសថសាស្ត្រ'),
    ('Dentistry', 'ធ្មេញ'),
    ('Nursing', 'គួបពយាបាល'),
    ('Public Health', 'សុខភាពសាធារណៈ')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'UHS'
ON CONFLICT DO NOTHING;

-- RUA
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Agronomy', 'ជំនាញដំណាំ'),
    ('Animal Science', 'ជំនាញសត្វ'),
    ('Agricultural Economics', 'សេដ្ឋកិច្ចកសិកម្ម'),
    ('Food Science', 'វិទ្យាសាស្ត្រអាហារ')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'RUA'
ON CONFLICT DO NOTHING;

-- RUFA
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Architecture', 'ស្ថាបត្យកម្ម'),
    ('Fine Arts', 'វិចិត្រសិល្បៈ'),
    ('Archaeology', 'បុរាណវិទ្យា'),
    ('Music', 'តន្ត្រី'),
    ('Dance', 'របាំ')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'RUFA'
ON CONFLICT DO NOTHING;

-- NPIC
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Civil Technology', 'បច្ចេកទេសសំណង់'),
    ('Electrical Technology', 'បច្ចេកទេសអគ្គិសនី'),
    ('Computer Technology', 'បច្ចេកទេសកុំព្យូទ័រ'),
    ('Tourism', 'ទេសចរណ៍')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'NPIC'
ON CONFLICT DO NOTHING;

-- NUBB
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Information Technology', 'បច្ចេកវិទ្យាព័ត៌មាន'),
    ('Business', 'សិក្សាពាណិជ្ជកម្ម'),
    ('Agriculture', 'កសិកម្ម'),
    ('Education', 'ការអប់រំ')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'NUBB'
ON CONFLICT DO NOTHING;

-- MCU
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Information Technology', 'បច្ចេកវិទ្យាព័ត៌មាន'),
    ('Business', 'វិទ្យាសាស្ត្រគ្រប់គ្រង'),
    ('English', 'អក្សរអង់គ្លេស')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'MCU'
ON CONFLICT DO NOTHING;

-- SRU
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Computer Science', 'វិទ្យាសាស្ត្រកុំព្យូទ័រ'),
    ('Business', 'ពាណិជ្ជកម្ម'),
    ('Education', 'ការអប់រំ')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'SRU'
ON CONFLICT DO NOTHING;

-- CSUKM
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Education', 'ការអប់រំ'),
    ('Business', 'ពាណិជ្ជកម្ម'),
    ('Information Technology', 'បច្ចេកវិទ្យាព័ត៌មាន')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'CSUKM'
ON CONFLICT DO NOTHING;

-- CADT
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('AI & Data Science', 'ប្រព័ន្ធឆ្លាតវៃ និងវិទ្យាសាស្ត្រទិន្នន័យ'),
    ('Cybersecurity', 'សុវត្ថិភាពព័ត៌មានអ៊ីនធឺណិត'),
    ('Software Engineering', 'វិស្វកម្មកម្មវិធី'),
    ('Digital Business', 'ពាណិជ្ជកម្មឌីជីថល')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'CADT'
ON CONFLICT DO NOTHING;

-- NIE
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Education', 'ការអប់រំ'),
    ('Mathematics', 'គណិតវិទ្យា'),
    ('Science', 'វិទ្យាសាស្ត្រ'),
    ('Literature', 'អក្សរសាស្ត្រ')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'NIE'
ON CONFLICT DO NOTHING;

-- NIB
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Business', 'ពាណិជ្ជកម្ម'),
    ('Accounting', 'គណនេយ្យ'),
    ('Finance', 'ហិរញ្ញវត្ថុ')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'NIB'
ON CONFLICT DO NOTHING;

-- PNIA
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Information Technology', 'បច្ចេកវិទ្យាព័ត៌មាន'),
    ('Telecommunications', 'ទូរគមនាគមន៍'),
    ('Logistics', 'ភស្តុភារ')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'PNIA'
ON CONFLICT DO NOTHING;

-- NISA
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Statistics', 'ស្ថិតិ'),
    ('Data Science', 'វិទ្យាសាស្ត្រទិន្នន័យ')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'NISA'
ON CONFLICT DO NOTHING;

-- AUPP
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Computer Science', 'វិទ្យាសាស្ត្រកុំព្យូទ័រ'),
    ('Business Administration', 'គ្រប់គ្រងពាណិជ្ជកម្ម'),
    ('International Relations', 'ទំនាក់ទំនងអន្តរជាតិ'),
    ('Psychology', 'ចិត្តវិទ្យា')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'AUPP'
ON CONFLICT DO NOTHING;

-- PUC
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Computer Science', 'វិទ្យាសាស្ត្រកុំព្យូទ័រ'),
    ('Law', 'ច្បាប់'),
    ('Business', 'ពាណិជ្ជកម្ម'),
    ('Dentistry', 'ធ្មេញ'),
    ('Architecture', 'ស្ថាបត្យកម្ម'),
    ('Education', 'ការអប់រំ')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'PUC'
ON CONFLICT DO NOTHING;

-- SBU
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Buddhist Studies', 'ពុទ្ធសាស្ន'),
    ('Philosophy', '철학')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'SBU'
ON CONFLICT DO NOTHING;

-- BBU
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Information Technology', 'បច្ចេកវិទ្យាព័ត៌មាន'),
    ('Business', 'ពាណិជ្ជកម្ម'),
    ('Law', 'ច្បាប់'),
    ('Architecture', 'ស្ថាបត្យកម្ម')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'BBU'
ON CONFLICT DO NOTHING;

-- Norton University
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Information Technology', 'បច្ចេកវិទ្យាព័ត៌មាន'),
    ('Business', 'ពាណិជ្ជកម្ម'),
    ('Engineering', 'វិស្វកម្ម'),
    ('Law', 'ច្បាប់')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'NU'
ON CONFLICT DO NOTHING;

-- University of Cambodia
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Business', 'ពាណិជ្ជកម្ម'),
    ('Information Technology', 'បច្ចេកវិទ្យាព័ត៌មាន'),
    ('Law', 'ច្បាប់'),
    ('International Relations', 'ទំនាក់ទំនងអន្តរជាតិ'),
    ('Education', 'ការអប់រំ')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'UC'
ON CONFLICT DO NOTHING;

-- Paragon
INSERT INTO departments (university_id, name_en, name_kh)
SELECT u.id, d.name_en, d.name_kh FROM universities u,
  (VALUES
    ('Business', 'ពាណិជ្ជកម្ម'),
    ('Information Technology', 'បច្ចេកវិទ្យាព័ត៌មាន'),
    ('Tourism', 'ទេសចរណ៍')
  ) AS d(name_en, name_kh)
WHERE u.abbreviation = 'PIU'
ON CONFLICT DO NOTHING;
