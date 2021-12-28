import React, { useEffect } from 'react'
import Hero from '../Components/Hero/Hero'
import ProductCard from '../Components/ProductCard/ProductCard'
import { clientStore, serverStore } from '../store/store'
import { fetchName, fetchEmailAddresses, spysrFetchData } from '../store/actions'
import { Link } from 'react-router-dom'

const Home = () => {
  const store = clientStore()

  useEffect(() => {
    store.dispatch(fetchName())
    store.dispatch(fetchEmailAddresses())
    store.dispatch(spysrFetchData())
  }, [])

  return (
    <div>
      <Hero title={'Gaurav Patel'} subtitle="Resume Link" />
      <section className="section">
        <div className="container">
          <h2>I am using fakestoreapi to fetch data. Below is the fetched data</h2>
          {/* <div>
            <img style={{ maxWidth: 200 }} src="/img/react-logo.svg" />
          </div>

          <Link to="/tutorials">Go to the tutorials</Link> */}
          <p>
            
          </p>
          <br />
          {/* <ul>
            {store.state?.emails ? (
              store.state?.emails?.map((email, i) => <li key={i}>{email}</li>)
            ) : (
              <div>...loading</div>
            )}
          </ul>
          <br />
          <ul>
            {store.state?.products ? (
              store.state?.products?.map((product, i) => <li key={i}>{product.title}</li>)
            ) : (
              <div>...loading</div>
            )}
          </ul> */}
          <div className="row">
            {store.state?.products ?  (
              store.state?.products?.map((product,i)=> <ProductCard 
              key={product.id}
              product={product}           
              />)
            ) : (
              <div>..loading</div>
            )
            }
          </div>
        </div>
      </section>
    </div>
  )
}


Home.prefetchData = () => {
  // if you fetch only one resource you can simply use ↵
  // return serverStore.dispatch(fetchName())
  // but if you fetch multiple resources use an array ↵
  return [serverStore.dispatch(fetchName()), serverStore.dispatch(fetchEmailAddresses()), serverStore.dispatch(spysrFetchData())]
}

export default Home
