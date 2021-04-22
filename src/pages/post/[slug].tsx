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


interface Post {
  first_publication_date: string | null;
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

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  console.log(post)
  const router = useRouter();

  if(router.isFallback){
    console.log('Carregando dados do Prismic ...')
    return <p>Carregando... </p>
  }
  const dateFormatted = format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR })

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
            <span>{dateFormatted}</span>
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

  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});
  /* console.log(JSON.stringify(response, null , 2));
*/


  const post   = {
    uid: response.uid,
    first_publication_date : response.first_publication_date,
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

  //   // TODO
  return {
    props: {
      post
    },
    revalidate: 60*60*12
  }
};
