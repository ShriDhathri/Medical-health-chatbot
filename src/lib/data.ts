import { Phone, MessageSquare, Users, BookHeart } from 'lucide-react';
import type { Resource } from './types';

export const resources: Resource[] = [
  {
    id: '1',
    name: 'National Suicide Prevention Lifeline',
    description: 'Provides 24/7, free and confidential support for people in distress, prevention and crisis resources for you or your loved ones.',
    url: 'https://988lifeline.org/',
    icon: Phone,
  },
  {
    id: '2',
    name: 'Crisis Text Line',
    description: 'Connect with a crisis counselor for free, 24/7 support. Text HOME to 741741 from anywhere in the US.',
    url: 'https://www.crisistextline.org/',
    icon: MessageSquare,
  },
  {
    id: '3',
    name: 'The Trevor Project',
    description: 'The leading national organization providing crisis intervention and suicide prevention services to LGBTQ young people under 25.',
    url: 'https://www.thetrevorproject.org/',
    icon: Users,
  },
  {
    id: '4',
    name: 'NAMI (National Alliance on Mental Illness)',
    description: 'The nation’s largest grassroots mental health organization dedicated to building better lives for the millions of Americans affected by mental illness.',
    url: 'https://www.nami.org/',
    icon: Users,
  },
  {
    id: '5',
    name: 'Mental Health America (MHA)',
    description: 'A leading community-based nonprofit dedicated to addressing the needs of those living with mental illness and promoting the overall mental health of all.',
    url: 'https://www.mhanational.org/',
    icon: BookHeart,
  },
    {
    id: '6',
    name: 'Anxiety & Depression Association of America',
    description: 'An international nonprofit organization dedicated to the prevention, treatment, and cure of anxiety, depression, OCD, PTSD, and co-occurring disorders.',
    url: 'https://adaa.org/',
    icon: BookHeart,
  }
];
