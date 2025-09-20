import { Phone, MessageSquare, Users, BookHeart, Heart } from 'lucide-react';
import type { Resource } from './types';

export const resources: Resource[] = [
  {
    id: '1',
    name: 'Vandrevala Foundation',
    description: 'Provides 24/7, free and confidential mental health crisis support across India for individuals experiencing distress or suicidal feelings.',
    url: 'https://www.vandrevalafoundation.com/',
    icon: Phone,
  },
  {
    id: '2',
    name: 'iCALL Psychosocial Helpline',
    description: 'A service by TISS, Mumbai, offering free counseling by phone and email from trained mental health professionals.',
    url: 'http://icallhelpline.org/',
    icon: MessageSquare,
  },
  {
    id: '3',
    name: 'SNEHA Foundation India',
    description: 'A suicide prevention organization based in Chennai offering unconditional emotional support for the depressed, distressed, and suicidal.',
    url: 'https://snehaindia.org/new/',
    icon: Users,
  },
  {
    id: '4',
    name: 'AASRA',
    description: 'A 24/7 helpline for those who are distressed, depressed, or suicidal, offering confidential emotional support.',
    url: 'http://www.aasra.info/',
    icon: Heart,
  },
  {
    id: '5',
    name: 'NIMHANS Centre for Well Being',
    description: 'The National Institute of Mental Health and Neuro-Sciences offers psychological support and mental health services.',
    url: 'https://nimhans.ac.in/well-being-centre/',
    icon: BookHeart,
  },
    {
    id: '6',
    name: 'Fortis National Mental Health Helpline',
    description: 'A 24x7 helpline by Fortis Healthcare providing immediate psychological support and crisis intervention by a team of experts.',
    url: 'https://www.fortishealthcare.com/india/fortis-mental-health-program',
    icon: Phone,
  }
];
