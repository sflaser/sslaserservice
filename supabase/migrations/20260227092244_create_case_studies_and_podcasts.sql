/*
  # Create Case Studies and Podcasts Tables

  1. New Tables
    - `case_studies`: 存储案例研究内容
      - `id` (uuid, primary key)
      - `title` (text) - 案例标题
      - `description` (text) - 案例描述
      - `image_url` (text) - 案例图片
      - `client_name` (text) - 客户名称
      - `industry` (text) - 行业
      - `results` (jsonb) - 成果数据
      - `featured` (boolean) - 是否精选
      - `published_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `podcasts`: 存储播客内容
      - `id` (uuid, primary key)
      - `title` (text) - 播客标题
      - `description` (text) - 播客描述
      - `image_url` (text) - 播客封面
      - `audio_url` (text) - 音频文件URL
      - `duration` (integer) - 时长（秒）
      - `episode_number` (integer) - 集数
      - `guest_name` (text) - 嘉宾名称
      - `published_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Public read policies for viewing published content
    - Admin-only write/update/delete policies (for authenticated admin users)
*/

-- Create case_studies table
CREATE TABLE IF NOT EXISTS case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  client_name text NOT NULL,
  industry text NOT NULL,
  results jsonb,
  featured boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create podcasts table
CREATE TABLE IF NOT EXISTS podcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  audio_url text NOT NULL,
  duration integer,
  episode_number integer,
  guest_name text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

-- Create policies for case_studies
CREATE POLICY "Anyone can view published case studies"
  ON case_studies FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert case studies"
  ON case_studies FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Only admins can update case studies"
  ON case_studies FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Only admins can delete case studies"
  ON case_studies FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Create policies for podcasts
CREATE POLICY "Anyone can view published podcasts"
  ON podcasts FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert podcasts"
  ON podcasts FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Only admins can update podcasts"
  ON podcasts FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Only admins can delete podcasts"
  ON podcasts FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');
