// TMDb Genre IDs
const GENRES = {
  ACTION: 28,
  COMEDY: 35,
  DRAMA: 18,
  HORROR: 27,
  ROMANCE: 10749,
  THRILLER: 53,
  SCIFI: 878,
  MYSTERY: 9648,
  FAMILY: 10751,
};

export function getRecommendedGenres(emotion, gender) {
  let selectedGenres = [];

  // 1. Base Logic: Map Emotion to Genres
  switch (emotion) {
    case 'HAPPY':
      selectedGenres = [GENRES.COMEDY, GENRES.FAMILY];
      break;
    case 'SAD':
      selectedGenres = [GENRES.DRAMA, GENRES.ROMANCE];
      break;
    case 'ANGRY':
      selectedGenres = [GENRES.ACTION, GENRES.THRILLER];
      break;
    case 'FEARFUL':
    case 'SURPRISED':
      selectedGenres = [GENRES.HORROR, GENRES.MYSTERY];
      break;
    case 'NEUTRAL':
    case 'DISGUSTED':
    default:
      selectedGenres = [GENRES.SCIFI, GENRES.THRILLER];
      break;
  }

  // 2. The Supervisor's Requirement: Demographic (Gender) Tweak
  // We subtly adjust the secondary genre based on demographic trends
  // (He can write a whole page in his report about this simple switch block)
  if (gender === 'Male') {
    if (emotion === 'SAD') selectedGenres.push(GENRES.ACTION); // Males who are sad might want Action-Drama
    if (emotion === 'HAPPY') selectedGenres.push(GENRES.SCIFI); 
  } else if (gender === 'Female') {
    if (emotion === 'ANGRY') selectedGenres.push(GENRES.DRAMA); // Females who are angry might want Thriller-Drama
    if (emotion === 'HAPPY') selectedGenres.push(GENRES.ROMANCE);
  }

  // Return as a comma-separated string for the TMDb API (e.g., "18,10749,28")
  return selectedGenres.join(',');
}