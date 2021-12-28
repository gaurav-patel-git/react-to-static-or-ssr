import React, { FunctionComponent } from 'react'
import styles from './Hero.module.css'

interface Props {
  title: string
  subtitle?: string
}

const Hero: FunctionComponent<Props> = ({ title, subtitle }) => {
  return (
    <section className={styles.root}>
      <div className="container">
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <a href='https://gauravpatel.live' className={styles.subtitle}>{subtitle}</a> : null}
      </div>
    </section>
  )
}

export default Hero
