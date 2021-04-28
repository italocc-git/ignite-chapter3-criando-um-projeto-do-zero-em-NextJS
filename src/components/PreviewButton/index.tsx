import styles from './previewButton.module.scss'

export const PreviewButton = () => {
  return(
    <button className={styles.buttonContainer}>
      <span>Sair do modo Preview</span>
    </button>
  )
}
