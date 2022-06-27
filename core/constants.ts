import { PageType, RobotsContent, MetaTags } from '../interfaces/meta-tags';
import { concatenateStrings } from '../shared/helpers/helper';

export const defaultMetaTags: MetaTags = {
  canonical: `${process.env.DOMAIN_PUBLIC}`,
  description: 'Nhà từng nuôi rất nhiều mèo',
  image: 'https://www.techhive.io/image.png',
  robots: concatenateStrings(RobotsContent.index, RobotsContent.follow),
  title: 'Haiconmeo',
  type: PageType.website
};
