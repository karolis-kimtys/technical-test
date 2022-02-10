import { useState } from 'react'
import './SearchBar.css'

import { useGlobalContext } from '../../../Context/Context'

import {
  fetchProperties,
  fetchPropertyDetails
} from '../../../frontend_engineer/api'

export default function SearchBar() {
  const { setIsProperties, setIsSearchError, setIsLoading } = useGlobalContext()
  const [isSelection, setIsSelection] = useState<any>([])
  const [isIDs, setIsIDs] = useState<any>([])
  const [isAddresses, setIsAddresses] = useState([])
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const [isSelected, setIsSelected] = useState('')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true)
    setIsSelected(event.target.value)
    let list: any = []
    let ids: any = []

    event.target.value.length > 0
      ? fetchProperties({ address: event.target.value })
          .then((response) => {
            setIsSelection(response.properties)
            Object.values(response).map((property: any) => {
              return property.map((value: any) => {
                list.push(value.address)
                ids.push(value.id)
                return null
              })
            })
            setIsIDs([ids])
            setIsAddresses(list)
            setIsAutocompleteOpen(true)
            setIsLoading(false)
          })
          .catch((error) => {
            console.log(error)
            setIsAutocompleteOpen(false)
            setIsLoading(false)
          })
      : (function () {
          setIsAddresses([])
          setIsSelection([])
          setIsLoading(false)
          setIsAutocompleteOpen(false)
        })()
  }

  let listPropertyDetails: any = []
  const onSubmit = () => {
    setIsAutocompleteOpen(false)
    setIsSearchError(false)

    typeof isIDs === 'undefined' && setIsSearchError(true)

    typeof isIDs === 'string' &&
      fetchPropertyDetails(isIDs).then((response) => {
        listPropertyDetails.push(response.property)
        setIsProperties(listPropertyDetails)
        setIsAutocompleteOpen(false)
      })

    typeof isIDs === 'object' &&
      isIDs[0].forEach((id: any) => {
        fetchPropertyDetails(id)
          .then((response) => {
            listPropertyDetails.push(response.property)
            setIsProperties([...listPropertyDetails])
            setIsAutocompleteOpen(false)
          })
          .catch((error) => {
            console.log(error)
            setIsAutocompleteOpen(false)
            setIsSearchError(true)
            setIsAddresses([])
            setIsSelection([])
            setIsProperties([])
          })
      })

    setIsSelected('')
  }

  return (
    <form className='search-bar'>
      <h3 data-testid='title'>Search</h3>
      <div className='search-bar-container'>
        <input
          data-testid='input-field'
          value={isSelected}
          type='search'
          name='address'
          placeholder='Enter address here...'
          onChange={(e) => {
            handleChange(e)
          }}
        />

        <button
          data-testid='search-button'
          type='submit'
          className='search-bar-button'
          onClick={() => {
            onSubmit()
          }}
          disabled={isSelected === ''}>
          Search
        </button>
      </div>

      {isAutocompleteOpen && (
        <div
          className='autocomplete-container'
          data-testid='autocomplete-container'>
          {isAddresses.map((value: string, key: number) => {
            return (
              <p
                data-testid='address-suggestion'
                key={key}
                className='autocomplete-item'
                onClick={() => {
                  setIsSelected(value)
                  setIsIDs(isSelection[key].id)
                  setIsAutocompleteOpen(false)
                }}>
                {value}
              </p>
            )
          })}
        </div>
      )}
    </form>
  )
}
