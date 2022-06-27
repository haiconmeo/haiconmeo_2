import { createClient } from 'contentful';
import { BlogPost } from '../interfaces/post';

export const CONTENT_TYPE_BLOGPOST = 'haiconmeo';
export const CONTENT_TYPE_PERSON = 'author';
export const CONTENT_TYPE_TAGS = 'tag';

const Space = process.env.CONTENTFUL_SPACE;
const Token = process.env.CONTENTFUL_TOKEN;

export class ContentfulService {
  private client = createClient({
    space: Space,
    accessToken: Token
  });

  /**
   * Maps the items fetched by contentful
   * @param entries
   */
  private mapData(entries): BlogPost[] {

    return entries.map(({ sys, fields }: { sys: any; fields: any }) => ({
      id: sys.id,
      title: fields.title,
      description: fields.sub,
      heroImage: fields.coverImage.fields.file.url,
      slug: fields.slug,
      //tags: fields.tags,
      publishedAt: fields.date
        ? new Date(fields.date)
        : new Date(sys.createdAt)
    }));
  }

  async fetchPostBySlug(slug) {
    return await this.client.getEntries({
      content_type: CONTENT_TYPE_BLOGPOST,
      'fields.slug': slug
    });
  }

  /**
   * Get all tags
   */
  async getAllTags() {
    const content = await this.client.getTags();
    const tags = content.items.map(
      ({ sys, name }: { sys: any; name: any }) => ({
        id: sys.id,
        name: name
      })
    );

    return { tags };
  }

  async getBlogPostEntries(
    { limit, skip, tag }: { limit?: number; skip?: number; tag?: string } = {
      limit: 5,
      skip: 0,
      tag: null
    }
  ) {
    try {
      let filter:any;
      if (tag) {
        filter = {
          'metadata.tags.sys.id[in]': tag,
          include: 1,
          limit,
          skip,
          order: 'fields.date',
          content_type: CONTENT_TYPE_BLOGPOST
        }
      }
      else{
        filter = {
          include: 1,
          limit,
          skip,
          order: 'fields.date',
          content_type: CONTENT_TYPE_BLOGPOST
        }
      }
      const contents = await this.client.getEntries(filter);

      const entries = this.mapData(contents.items);

      const total = contents.total;
      return { entries, total, limit, skip };
    } catch (error) {
      // TODO: add error handling
      console.log(error);
    }
  }

  async getPostBySlug(slug) {
    
    const entries = await this.client.getEntries({
      content_type: "haiconmeo",
      limit: 1,
      "fields.slug[in]": slug,
    });    if (entries.items) {
      return entries.items[0].fields;
    }
    console.log(`Error getting Entries for `);
  }

  async fetchSuggestions(tags: string[], currentArticleSlug: string) {
    const limit = 3;
    let entries = [];

    const initialOptions = {
      content_type: CONTENT_TYPE_BLOGPOST,
      limit,
      // find at least one matching tag, else undefined properties are not copied
      'fields.tags.sys.id[in]': tags.length ? tags.join(',') : undefined,
      'fields.slug[ne]': currentArticleSlug // exclude current article
    };

    try {
      const suggestionsByTags = await this.client.getEntries(initialOptions);

      entries = suggestionsByTags.items;
      // number of suggestions by tag is less than the limit
      if (suggestionsByTags.total < limit) {
        // exclude already picked slugs
        const slugsToExclude = [
          ...suggestionsByTags.items,
          { fields: { slug: currentArticleSlug } }
        ]
          .map((item: { fields: any }) => item.fields.slug)
          .join(',');

        // fetch random suggestions
        const randomSuggestions = await this.client.getEntries({
          content_type: CONTENT_TYPE_BLOGPOST,
          limit: limit - suggestionsByTags.total,
          'fields.slug[nin]': slugsToExclude // exclude slugs already fetched
        });

        entries = [...entries, ...randomSuggestions.items];
      }

      entries = this.mapData(entries);

      return entries;
    } catch (e) {
      console.error(e);
    }
  }
}
