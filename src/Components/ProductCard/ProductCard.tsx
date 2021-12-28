import React, { FunctionComponent } from 'react'
import { Url } from 'url'
import styles from './ProductCard.module.css'

interface Props {
    product: {[key: string]: any}
    // description: string
    // image: string
    // price: number
    // category: string
    // id: number

}

const ProductCard: FunctionComponent<Props> = ({ product}) => {
    return (
        <div className={styles.column} >
            <div className={styles.card}>
                <img src={product.image} alt="Denim Jeans" className={styles.img}/>
                <h1>{product.title}</h1>
                <p className={styles.price}>${product.price}</p>
                <p>{product.description}</p>
                <p><button>Add to Cart</button></p>
            </div>
        </div>
    )
}

export default ProductCard
