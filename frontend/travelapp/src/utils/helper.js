import ADD_STORY_IMG from '../assets/empty.jpg'
import NO_SEARCH_IMG from '../assets/search-cross.svg'
import NO_FILTER_IMG from '../assets/notfound.png'

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getInitials = (name) => {
  if (!name) return "";

  const words = name.split(" ");
  let initials = "";

  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }

  return initials.toUpperCase();
};

export const getEmptyCardMessage = (filterType) => {
  switch (filterType) {
    case "search":
      return "No Stories Found Matching Your Search";

    case "date":
      return "No Stories Found for the Selected Date Range";

    default:
      return `Start Creating Your First Travel Story! Click the 'ADD' Button To Write Down Your Thoughts, Ideas and Memories. Let's Get Started`;
  }
};

export const getEmptyCardImg = (filterType) => {
  switch (filterType) {
    case "search":
      return NO_SEARCH_IMG;

    case "date":
      return NO_FILTER_IMG;

    default:
      return ADD_STORY_IMG;
  }
};
