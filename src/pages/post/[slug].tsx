import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic   from '@prismicio/client';
import { getPrismicClient  } from '../../services/prismic';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'
import commonStyles from '../../styles/common.module.scss';
import Header from '../../components/Header';
import styles from './post.module.scss';
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import Head from "next/head"
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Link from 'next/Link';
import {UtterancComments} from '../../components/UtterancComments'
import {PreviewButton} from '../../components/PreviewButton'
import { useState } from 'react';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PreviousPost  {
  uid? : string;
  title?: string;
}
interface NextPost  {
  uid? : string;
  title?: string;
}

interface PostProps {
  post: Post;
  previousPost? : PreviousPost
  nextPost ?: NextPost
}

export default function Post({ post , previousPost, nextPost}: PostProps) {

  const router = useRouter();

  if(router.isFallback){
    console.log('Carregando dados do Prismic ...')
    return <p>Carregando... </p>
  }
  const publicationDateFormatted = format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR })

  const lastEditionDateFormatted = format(new Date(post.last_publication_date), "'*editado em 'dd MMM yyyy',às 'HH:MM " , {locale:ptBR})
  const totalWords = post.data.content.reduce((total , element) => {
    const totalHeading = element.heading.split(' ').length

    total += totalHeading

    const totalBody = element.body.map(body => body.text.split(' ').length)

    totalBody.map(wordsQuantity => total+= wordsQuantity);

    return(
      total
    )
  },0)

  const wordsPerMinute =  Math.ceil(totalWords/200)

  return (
    <>
      <Head>
        <title>{post.data.title} | SpaceTraveling</title>
      </Head>
      < Header />
      <div className={styles.imagePost}>
        <img src={post.data.banner.url}  />
      </div>
      <div className={`${styles.postContainer}`}>
        <h1 className={styles.postTitle}>{post.data.title}</h1>
        <div className={styles.postDetails}>
          <div className={styles.postDetailsItem}>
            <FiCalendar />
            <span>{publicationDateFormatted}</span>
          </div>
          <div className={styles.postDetailsItem}>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div className={styles.postDetailsItem}>
            <FiClock />
            <span>{` ${wordsPerMinute} min`} </span>
          </div>
        </div>
        <div className={styles.postLastUpdate}>
          <span>{lastEditionDateFormatted}</span>
        </div>
        <div className={styles.postContent}>
          {post.data.content.map(content => (
            <div key={content.heading}>
              <h1 >{content.heading}</h1>
              {content.body.map(bodyItem => (
                <p key={bodyItem.text}>
                  {bodyItem.text}
                </p>
              ))}
            </div>
          ))}

        </div>
        <div className={styles.postContentFooterLine} />
        <div className={styles.postContentFooter}>
          {previousPost.title && (
          <div className={styles.postContentFooterItem}>
            <p>{previousPost.title}</p>
            <Link href={`/post/${previousPost.uid}`}>
              <a >post anterior</a>
            </Link>

          </div>
          )}
          {nextPost.title && (
            <div className={styles.postContentFooterItem}>
              <p>{nextPost.title}</p>
              <Link href={`/post/${nextPost.uid}`}>
                <a >próximo post</a>
              </Link>

            </div>
          )}

        </div>

       <UtterancComments />
       <PreviewButton/>
      </div>
    </>
  )

}



export const getStaticPaths: GetStaticPaths = async () => {

  const prismic = getPrismicClient();

    const {results} = await prismic.query(
      [Prismic.predicates.at('document.type','posts')],
      {
        pageSize: 2
      }

   );
   const paths = results.map(post => ({
     params : {
       slug : post.uid
     }
   }))
   console.log(paths)
  return {
    paths: paths,
    fallback: true
  }
  //   // TODO
};

export const getStaticProps: GetStaticProps = async context => {

  const { slug  } = context.params;
  const prismic = getPrismicClient();


  const response = await prismic.getByUID('posts', String(slug), {});
  /* console.log(JSON.stringify(response, null , 2));
*/

  if(!response) { //Caso não retorne nada a requisição
    return{
      redirect:{
        destination:'/',
        permanent:false
      }
    }
  }

  const post   = {
    uid: response.uid,
    first_publication_date : response.first_publication_date,
    last_publication_date : response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,

      },
      content: response.data.content.map(item => ({
        heading: item.heading,
        body: [...item.body]
      }))
    }

  }

  const responsePreviousPost = (
    await prismic.query(
    Prismic.predicates.dateBefore(
      'document.first_publication_date',
      response.first_publication_date
    ),
    { orderings: '[document.first_publication_date]'}
  )
  ).results.pop()

  const previousPost = {
    uid: responsePreviousPost?.uid ? responsePreviousPost.uid : '',
    title: responsePreviousPost?.data.title ? responsePreviousPost.data.title : '',
  }

   const responseNextPost = (
    await prismic.query(
    Prismic.predicates.dateAfter(
    'document.first_publication_date',
    response.first_publication_date
    ),
    { orderings: '[document.first_publication_date]' }
  )).results[0]

  const nextPost = {
    uid: responseNextPost?.uid ? responseNextPost.uid : '',
    title: responseNextPost?.data.title ? responseNextPost.data.title : '',
  }


  //   // TODO
  return {
    props: {
      previousPost,
      post,
      nextPost

    },
    revalidate: 60*60*12
  }
};
