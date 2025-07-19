-- Create a table for lecture links
CREATE TABLE public.lecture_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lecture_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lecture_links ENABLE ROW LEVEL SECURITY;

-- Create policies for lecture links
CREATE POLICY "Anyone can view lecture links" 
ON public.lecture_links 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create lecture links" 
ON public.lecture_links 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update lecture links" 
ON public.lecture_links 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete lecture links" 
ON public.lecture_links 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lecture_links_updated_at
BEFORE UPDATE ON public.lecture_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();