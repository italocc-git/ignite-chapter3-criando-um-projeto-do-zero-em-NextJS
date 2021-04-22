import Link from 'next/Link'
import styles from './header.module.scss'
export default function Header() {
  // TODO
  return(
    <header className={styles.headerContainer}>

      <Link href='/'  >
        <a className={styles.headerContent}>
          <img src='/images/logo.svg' alt='logo' />
          <span> spacetraveling <strong>.</strong></span>
        </a>
      </Link >
    </header>

  )

}
