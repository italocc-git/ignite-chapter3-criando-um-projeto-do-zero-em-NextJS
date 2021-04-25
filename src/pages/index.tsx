import { GetStaticProps } from 'next';
import Link  from 'next/Link'
import Prismic  from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';
import {FiCalendar, FiUser} from 'react-icons/fi'
import commonStyles from '../styles/common.module.scss';
import {format} from 'date-fns'
import {postFormatter} from '../utils/prismicResponseFormatter'
import ptBR from 'date-fns/locale/pt-BR'
import styles from './home.module.scss';
import Header from '../components/Header';
import { useEffect, useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

 export default function Home({postsPagination}:HomeProps) {

  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage , setNextPage] = useState(postsPagination.next_page)



   async function carregarMaisPosts(){
   const result = await fetch(nextPage ? nextPage : '').then(response => response.json()).then(data => {
      const dataFormatted = postFormatter(data);
      setPosts([...posts , ...dataFormatted.results])
      setNextPage(dataFormatted.next_page);

      return dataFormatted
    } )

   console.log(result)
  }


  /*  console.log(postsPagination.next_page);
   console.log(postsPagination.results) */
  return(
      <>
      <Header />
        {posts.map(post => (
           <Link key={post.uid} href={`/post/${post.uid}`}>
           <a  className={`${styles.homeContent} ${commonStyles.content}`}>

           <h1>{post.data.title}</h1>
           <p>{post.data.subtitle}</p>
           <div className={commonStyles.contentDetails}>
             <div className={commonStyles.contentDetailsItem}>
               <FiCalendar />
               <span>{format(new Date(post.first_publication_date),'dd MMM yyyy',{locale:ptBR})}</span>
             </div>
             <div className={commonStyles.contentDetailsItem}>
               <FiUser />
               <span>{post.data.author}</span>
             </div>
           </div>
         </a>
         </Link>
        ))}
        {nextPage && (
          <button  onClick={carregarMaisPosts} className={styles.homeFooter}>
            Carregar mais posts
          </button>

        )}
  {/*
         <button type='button' onClick={carregarMaisPosts}>Carregar mais posts</button>*/}
      </>
  )
 }

 export const getStaticProps : GetStaticProps= async () => {
    const prismic = getPrismicClient();
    const postsResponse = await prismic.query(
      [
        Prismic.Predicates.at('document.type','posts')
      ],
      {
        fetch : ['posts.title', 'posts.subtitle',
        'posts.author'],
        pageSize:2
      }
    );
      /* console.log(postsResponse.results) */


      /* console.log(nextPage) */
      const posts :Post[] = postsResponse.results.map(post => ({
        uid: post.uid,
        first_publication_date :post.first_publication_date,
        data : {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author : post.data.author,
        },


      }))
      const nextPage = postsResponse.next_page

return {
  props : {
    postsPagination : {
      next_page : nextPage,
      results :posts,

   }
  }

  }
 };
