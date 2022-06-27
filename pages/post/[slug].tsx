import { NextPage } from 'next';
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import React from 'react';
import { BLOCKS, INLINES } from "@contentful/rich-text-types";

import Layout from '../../shared/components/layout/layout.component';
import { ContentfulService } from '../../core/contentful';

import { BlogPost } from '../../interfaces/post';
import { MetaTags, PageType, RobotsContent } from '../../interfaces/meta-tags';
import Card from '../../shared/components/card/card.component';

type Props = {
  article: BlogPost;
};


const PostPage: NextPage<Props, any> = (props: Props) => {
  const postMetaTags: MetaTags = {
    canonical: `${process.env.DOMAIN_PUBLIC}`,
    description: `${props.article.sub}`,
     image: `https:${props.article.coverImage}`,
    robots: `${RobotsContent.follow},${RobotsContent.index}`,
    title: `${props.article.title}`,
    type: PageType.article
  };
  const options = {
    renderNode: {
      [BLOCKS.EMBEDDED_ASSET]: (node) => {
        const { url, fileName } = node.data.target.fields.file;
        return (
          <img
            src={url}
            alt={fileName}
            style={{ height: "auto", width: "100%", margin: "1em 0" }}
          />
        );
      },
      [INLINES.HYPERLINK]: (node) => {
        const { uri } = node.data;
        const { value } = node.content[0];
        return (
          <a target="_blank" rel="noreferrer noopener" href={uri}>
            {value}
          </a>
        );
      },
    },
  };
  return (
    <Layout metaTags={postMetaTags}>
      <div className="post-container" id="post-container">
        <div className="post-header">
          <h1>{props.article.title}</h1>
          <div className="author">
          </div>
        </div>        
        {documentToReactComponents(props.article.content, options)}       
       
      </div>
      <div className="suggestions"></div>
    </Layout>
  );
};

PostPage.getInitialProps = async ( slug ) => {
  const contentfulService = new ContentfulService();  
  const  post  = slug?.query.slug;
  const article = await contentfulService.getPostBySlug(post);
  return { article };
};

export default PostPage;
