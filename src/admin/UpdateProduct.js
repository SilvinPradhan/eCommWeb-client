import React, {useState, useEffect} from 'react'
import {Link, Redirect} from 'react-router-dom'
import {
    Avatar,
    Card,
} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';
import {getProduct, getCategories, updateProduct} from './apiAdmin'
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import Typography from "@material-ui/core/Typography";
import {CloudUpload} from "@material-ui/icons";
import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";
import CardContent from "@material-ui/core/CardContent";
import CircularProgress from '@material-ui/core/CircularProgress';
import {isAuthenticated} from "../auth/user";

const useStyles = makeStyles((theme) => ({
    root: {},
    heading: {
        color: '#264653',
        align: 'center',
    },
    avatar: {
        margin: '5px auto',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#264653',
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
        backgroundColor: '#264653',
    },
    back: {
        cursor: 'pointer',
        textDecoration: 'none',
        color: '#ffffff'
    },
    button: {
        margin: theme.spacing(1),
    },
    container: {
        minHeight: '300px'
    }
}));

const UpdateProduct = ({match}) => {

    const classes = useStyles();

    const {user, token} = isAuthenticated()

    const [values, setValues] = useState({
        name: '',
        description: '',
        price: '',
        categories: [],
        category: '',
        shipping: false,
        quantity: '',
        photo: '',
        loading: false,
        error: '',
        createdProduct: '',
        redirectToProfile: '',
        formData: ''
    })

    const [categories, setCategories] = useState([]);

    const {
        name,
        description,
        price,
        // categories,
        category,
        shipping,
        quantity,
        photo,
        loading,
        error,
        createdProduct,
        redirectToProfile,
        formData
    } = values

    const init = (productId) => {
        getProduct(productId).then((data) => {
            if (data.error) {
                setValues({...values, error: data.error})
            } else {
                //    populate the state
                console.log('data', data)
                setValues({
                    ...values,
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    category: data.category._id,
                    shipping: data.shipping,
                    quantity: data.quantity,
                    formData: new FormData()
                })
                //    load categories
                initCategories()
            }
        })
    }

    const initCategories = () => {
        getCategories().then(data => {
            if (data.error) {
                setValues({...values, error: data.error})
                toast.error('Categories has not been fetched!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } else {
                setCategories(data)
            }
        })
    }

    useEffect(() => {
        init(match.params.productId)
    }, [])

    const change = (name) => event => {
        const value = name === 'photo' ? event.target.files[0] : event.target.value
        formData.set(name, value)
        setValues({...values, [name]: value})
    }

    const onSubmit = (e) => {
        e.preventDefault()
        setValues({...values, error: '', loading: true})
        updateProduct(match.params.productId, user._id, token, formData).then(data => {
            if (data.error) {
                setValues({...values, error: data.error});
                toast.error('Product could not be updated.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } else {
                setValues({
                    ...values,
                    name: '',
                    description: '',
                    photo: '',
                    price: '',
                    quantity: '',
                    loading: false,
                    error: false,
                    redirectToProfile: true,
                    createdProduct: data.name
                })
            }
        })
    }

    const showLoading = () =>
        (loading && (<div className="alert alert-success">
                <CircularProgress color="secondary"/>
            </div>)
        )

    const showSuccess = () => (
        <div className="alert alert-info" style={{display: createdProduct ? " " : "none"}}>
            <h3>{`${createdProduct}`} has been updated!</h3>
        </div>
    )

    const redirectUser = () => {
        if (redirectToProfile) {
            if (!error) {
                return <Redirect to={'/'}/>
            }
        }
    }

    const newPostForm = () => (
        <form className="mb-3" onSubmit={onSubmit}>
            <div className="form-group">
                <Avatar className={classes.avatar}>
                    <FontAwesomeIcon icon={faPlusCircle}/>
                </Avatar>
            </div>
            <div className="form-group">
                <label className="btn btn-secondary">
                    <CloudUpload/> {'  '}
                    <input onChange={change('photo')} type="file" name="photo" accept="image/*"/>
                </label>
            </div>

            <div className="form-group">
                <label className="text-muted">Name</label>
                <input onChange={change('name')} type="text" className="form-control" value={name}/>
            </div>

            <div className="form-group">
                <label className="text-muted">Description</label>
                <textarea onChange={change('description')} className="form-control" value={description}/>
            </div>

            <div className="form-group">
                <label className="text-muted">Price</label>
                <input onChange={change('price')} type="number" className="form-control" value={price}/>
            </div>

            <div className="form-group">
                <label className="text-muted">Category</label>
                <select onChange={change('category')} className="form-control">
                    <option>Please Select One</option>
                    {
                        categories && categories.map((c, i) => (
                            <option key={i} value={c._id}>
                                {c.name}
                            </option>
                        ))
                    }
                </select>
            </div>

            <div className="form-group">
                <label className="text-muted">Shipping</label>
                <select onChange={change('shipping')} className="form-control">
                    <option>Select</option>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                </select>
            </div>

            <div className="form-group">
                <label className="text-muted">Quantity</label>
                <input onChange={change('quantity')} type="number" className="form-control" value={quantity}/>
            </div>

            <button className="btn btn-outline-primary">Update Product</button>
        </form>
    );

    return (
        <div>
            <ToastContainer/>
            <Card>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        Update Product
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        Good Day, ready to update the product today?
                    </Typography>
                </CardContent>
            </Card>
            <div className="row">
                <div className="container h-100 d-flex justify-content-center">
                    {
                        newPostForm()
                    }
                    {
                        showLoading()
                    }
                    {
                        showSuccess()
                    }
                    {
                        redirectUser()
                    }
                </div>

            </div>
        </div>
    )
}

export default UpdateProduct
