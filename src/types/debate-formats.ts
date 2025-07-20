export type DebateFormat = 'standard' | 'asian-parliamentary' | 'british-parliamentary';

export interface AsianParliamentaryRole {
  name: string;
  description: string;
  speakingTime: number; // in minutes
  position: 'government' | 'opposition';
}

export const asianParliamentaryRoles: AsianParliamentaryRole[] = [
  {
    name: 'Prime Minister',
    description: 'First speaker for the Government. Defines the motion and presents the Government\'s case.',
    speakingTime: 7,
    position: 'government'
  },
  {
    name: 'Leader of Opposition',
    description: 'First speaker for the Opposition. Rebuts the Prime Minister and presents the Opposition\'s case.',
    speakingTime: 7,
    position: 'opposition'
  },
  {
    name: 'Deputy Prime Minister',
    description: 'Second speaker for the Government. Rebuts the Leader of Opposition and extends the Government\'s case.',
    speakingTime: 7,
    position: 'government'
  },
  {
    name: 'Deputy Leader of Opposition',
    description: 'Second speaker for the Opposition. Rebuts the Deputy Prime Minister and extends the Opposition\'s case.',
    speakingTime: 7,
    position: 'opposition'
  },
  {
    name: 'Government Whip',
    description: 'Third speaker for the Government. Rebuts previous Opposition speakers and summarizes the Government\'s case.',
    speakingTime: 7,
    position: 'government'
  },
  {
    name: 'Opposition Whip',
    description: 'Third speaker for the Opposition. Rebuts previous Government speakers and summarizes the Opposition\'s case.',
    speakingTime: 7,
    position: 'opposition'
  },
  {
    name: 'Opposition Reply',
    description: 'Final speech for the Opposition. Summarizes the debate from the Opposition\'s perspective.',
    speakingTime: 4,
    position: 'opposition'
  },
  {
    name: 'Government Reply',
    description: 'Final speech for the Government. Summarizes the debate from the Government\'s perspective.',
    speakingTime: 4,
    position: 'government'
  }
];

export interface DebateFormatInfo {
  name: string;
  description: string;
  prepTime: number; // in minutes
  roles?: AsianParliamentaryRole[];
}

export const debateFormats: Record<DebateFormat, DebateFormatInfo> = {
  'standard': {
    name: 'Standard Debate',
    description: 'A flexible debate format with no specific roles or time constraints.',
    prepTime: 0
  },
  'asian-parliamentary': {
    name: 'Asian Parliamentary',
    description: 'A formal debate format with 8 speeches, including substantive speeches and reply speeches.',
    prepTime: 15,
    roles: asianParliamentaryRoles
  },
  'british-parliamentary': {
    name: 'British Parliamentary',
    description: 'A formal debate format with 8 speeches from 4 teams, commonly used in university competitions.',
    prepTime: 15
  }
};