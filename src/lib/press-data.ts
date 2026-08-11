/**
 * Press coverage of Raffles Boston · hotel, residences and venues.
 *
 * Every entry below is drawn from the official press room published at
 * https://rafflesresidencesboston.com/press/ · outlet, headline, date and
 * link are reproduced as published there. Nothing here is invented.
 */

export type PressScope = "International" | "National" | "Regional";

export interface PressItem {
  outlet: string;
  title: string;
  date: string; // ISO
  dateLabel: string;
  url: string;
  scope: PressScope;
  featured?: boolean;
}

const HOST = "https://rafflesresidencesboston.com";

export const PRESS_ROOM_URL = `${HOST}/press/`;
export const PRESS_CONTACT =
  "Lauren Soriano, Director of Public Relations · lauren.soriano@raffles.com";

export const PRESS_ITEMS: PressItem[] = [
  {
    outlet: "Travel + Leisure",
    title:
      "Raffles Just Opened Its First North American Hotel · and It's One of the Best Places I've Ever Stayed",
    date: "2024-01-02",
    dateLabel: "January 2, 2024",
    url: `${HOST}/site/assets/files/1391/the-raffles-residences-boston-1704171600_0001.pdf`,
    scope: "National",
    featured: true,
  },
  {
    outlet: "Esquire",
    title: "The 41 Best New Hotels in North America and Europe in 2024",
    date: "2024-04-09",
    dateLabel: "April 9, 2024",
    url: `${HOST}/site/assets/files/1402/the-raffles-residences-boston-1712635200_0001.pdf`,
    scope: "International",
    featured: true,
  },
  {
    outlet: "The Sydney Morning Herald",
    title: "North & South America's New Bucket List: 15 Dazzling Experiences",
    date: "2024-03-21",
    dateLabel: "March 21, 2024",
    url: `${HOST}/site/assets/files/1403/the-raffles-residences-boston-1710993600_0001.pdf`,
    scope: "International",
    featured: true,
  },
  {
    outlet: "Condé Nast Traveler",
    title: "Raffles Boston: First In",
    date: "2023-11-05",
    dateLabel: "November 5, 2023",
    url: `${HOST}/site/assets/files/1393/the-raffles-residences-boston-1730782800_0001.pdf`,
    scope: "International",
    featured: true,
  },
  {
    outlet: "Food & Wine",
    title: "Our Favorite Places to Eat, Sleep & Explore in Boston",
    date: "2024-02-12",
    dateLabel: "February 12, 2024",
    url: `${HOST}/site/assets/files/1404/the-raffles-residences-boston-1707714000_0001.pdf`,
    scope: "National",
  },
  {
    outlet: "Travel + Leisure",
    title: "The Best New City Hotels of 2023",
    date: "2024-04-16",
    dateLabel: "April 16, 2024",
    url: `${HOST}/site/assets/files/1398/the-raffles-residences-boston-1713240000_0001.pdf`,
    scope: "National",
  },
  {
    outlet: "Hemispheres",
    title: "The Best New Hotels of 2024",
    date: "2024-04-30",
    dateLabel: "April 30, 2024",
    url: `${HOST}/site/assets/files/1399/the-raffles-residences-boston-1714449600_0001.pdf`,
    scope: "National",
  },
  {
    outlet: "Elite Traveler",
    title: "The Long Weekend: A Luxury Guide to Boston",
    date: "2024-05-01",
    dateLabel: "May 1, 2024",
    url: `${HOST}/site/assets/files/1400/the-raffles-residences-boston-1714536000_0001.pdf`,
    scope: "International",
  },
  {
    outlet: "Boston.com",
    title: "Luxury Homes: See Inside the Raffles Unit Listed for $35k a Month",
    date: "2024-05-07",
    dateLabel: "May 7, 2024",
    url: "https://www.boston.com/real-estate/luxury-homes/2024/05/07/raffles-boston-condo-35k-a-month/",
    scope: "Regional",
  },
  {
    outlet: "Robb Report",
    title: "Raffles Boston Back Bay Hotel & Residences",
    date: "2021-12-01",
    dateLabel: "December 1, 2021",
    url: `${HOST}/site/assets/files/1356/the-raffles-residences-boston-1634616000_0002.pdf`,
    scope: "National",
  },
  {
    outlet: "Architectural Digest",
    title: "6 of the Hottest Luxury Developments in Boston",
    date: "2021-12-03",
    dateLabel: "December 3, 2021",
    url: `${HOST}/site/assets/files/1357/the-raffles-residences-boston-1634616000_0002.pdf`,
    scope: "National",
  },
  {
    outlet: "Forbes",
    title: "The First Raffles In North America To Open In Boston",
    date: "2021-03-26",
    dateLabel: "March 26, 2021",
    url: `${HOST}/site/assets/files/1366/the-raffles-residences-boston-1616731200_0001.pdf`,
    scope: "International",
  },
  {
    outlet: "New York Post",
    title: "Luxury Hotel Brand, Raffles, Makes North American Debut",
    date: "2022-10-26",
    dateLabel: "October 26, 2022",
    url: `${HOST}/site/assets/files/1380/the-raffles-residences-boston-1666756800_0002.pdf`,
    scope: "National",
  },
  {
    outlet: "Yankee Magazine",
    title: "Best New Hotel",
    date: "2023-05-01",
    dateLabel: "May 1, 2023",
    url: `${HOST}/site/assets/files/1386/the-raffles-residences-boston-1682913600_0001.pdf`,
    scope: "Regional",
  },
  {
    outlet: "The Boston Globe",
    title: "An Exclusive Peek Inside Raffles Boston",
    date: "2023-05-07",
    dateLabel: "May 7, 2023",
    url: `${HOST}/site/assets/files/1384/the-raffles-residences-boston-1683432000_0002.pdf`,
    scope: "Regional",
  },
  {
    outlet: "Chronicle, ABC Channel 5",
    title: "Luxury Awaits at Boston's Newest Hotel",
    date: "2023-11-07",
    dateLabel: "November 7, 2023",
    url: `${HOST}/site/assets/files/1394/the-raffles-residences-boston-1730955600_0002.pdf`,
    scope: "Regional",
  },
  {
    outlet: "Hemispheres",
    title: "Boston Cream: Get the Best of Beantown at these Brand-New Luxury Developments",
    date: "2023-07-01",
    dateLabel: "July 1, 2023",
    url: `${HOST}/site/assets/files/1389/the-raffles-residences-boston-1688184000_0001.pdf`,
    scope: "National",
  },
  {
    outlet: "Boston Business Journal",
    title: "Raffles Boston Hotel & Condos Now Open",
    date: "2023-11-05",
    dateLabel: "November 5, 2023",
    url: `${HOST}/site/assets/files/1392/the-raffles-residences-boston-1699156800_0001.pdf`,
    scope: "Regional",
  },
];

export const PRESS_SCOPES: PressScope[] = ["International", "National", "Regional"];
