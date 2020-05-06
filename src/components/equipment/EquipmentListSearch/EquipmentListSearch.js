import React, { useCallback, useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import './EquipmentListSearch.css';
import { v4 as uuidv4 } from 'uuid';
import { searchPublicEquipmentListDocuments } from './../../../server/firebase';
import {UserContext} from './../../../context/user';
import { countries } from './../../../server/countries';
import { Pagination } from '@material-ui/lab';
import {addFavoriteEquipmentListToUserTrip} from './../../../server/firebase';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { createMuiTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Zoom from '@material-ui/core/Zoom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';


const myTheme = createMuiTheme({
    typography: {
        fontFamily: 'Poppins, sans-serif'
    },
    overrides: {
        MuiInputLabel: { // Name of the component ⚛️ / style sheet
            root: { // Name of the rule
                fontSize: 14,
                "&$focused:not($error)": { // increase the specificity for the pseudo class
                    color: "#9c9c9c"
                },
                '&:hover:not($error)': {
                    color: "#9c9c9c",
                }
            }
        },
        MuiOutlinedInput: {
            root: {
                '& $notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
                    borderColor: '#9c9c9c',
                    // Reset on touch devices, it doesn't add specificity
                    '#media (hover: none)': {
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                },
                '&$focused $notchedOutline': {
                    borderColor: '#9c9c9c',
                    borderWidth: 1,
                },
            },
        }
    }
});

const RenderEquipmentLists = ({ lists, user }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const [error, setError] = useState(null);

    const numberOfListsPerPage = 10;

    const numberOfPages = Math.ceil(lists.length / numberOfListsPerPage);

    const handleChange = (event, value) => {
        setCurrentPage(value);
      };

    const indexOfLastList = currentPage * numberOfListsPerPage;
    const indexOfFirstList = indexOfLastList - numberOfListsPerPage;
    const currentLists = lists.slice(indexOfFirstList, indexOfLastList);

    const renderSeason = (season) => {
        return (
            <div className="list-season">
                <span>Season:</span> {season}
            </div>
        );
    }

    const renderCategory = (category) => {
        return (
            <div className="list-category">
                <span>Category:</span> {category}
            </div>
        );
    }

    const handleSetFavoriteEquipmentList = async (event, user, items) => {
        event.preventDefault();
        console.log('entered handleSetFavoriteEquipmentList');
        if (user.trip != null || user.trip) {
        console.log('entered trip is not null');
        try {
          await addFavoriteEquipmentListToUserTrip(user, items);
          console.log('trip updated');
          window.location.href = '/mytrip';
        }
        catch (error) {
          setError('Error creating trip');
        }
        } else {
            setError('Create trip first!');
            console.log("error need to create trip first-" , error);
            window.location.href = '/mytrip';
        }
    }
 
    const listsItems = currentLists.map((list) => {
        const eachListItems = list.data.list.map((item) => {
            return (
                <li key={item.id} className="equipmentlistitem">
                    <div className="equipmentlistitemcontent">
                    <div className="pretty p-icon p-round">
                        <div className="state">
                            <i className="icon mdi mdi-check"></i>
                            <span>{item.label}</span>
                        </div>
                    </div>
                    </div>
                </li>
            );
        });

        return (
            <div className="each-list-and-button">
            <div className="listcontainer">
            <li key={list.id}>
                <ul className="resultequipmentlist">
                    <div className="equipmentlistcontent">
                        <div className="list-title">
                        <h5>{list.data.displayName}'s Equipment List</h5>
                        </div>
                        <div className="list-metadata">
                        <div className="list-destination">
                            <span>Destination:</span> {list.data.destination}
                        </div>
                        <div className="list-season-and-category">
                        { list.data.season && renderSeason(list.data.season) }
                        { list.data.category && renderCategory(list.data.category) }
                        </div>
                        </div>
                        <div className="equipmentlist-container">
                        <div className="equipmentlistlist">
                            <ul>
                            {eachListItems}
                            </ul>
                        </div>
                        </div>
                    </div>
                </ul>
            </li>
            </div>
            <div className="fav-list-button">
            {user &&
            <Button variant="contained" color="secondary" style={{ width: 160, textTransform: 'none', fontWeight: 'bold', fontSize: 14, borderRadius: '20px' }}
            onClick={e => handleSetFavoriteEquipmentList(e, user, list.data.list)}>
            Set as my favorite Equipment List
            </Button>
            }
            </div>
            </div>
        );
    });

    return (
        <div className="lists-search-results">
            <ul className="equipmentlistslist">
                {listsItems}
            </ul>
            <div className="pagination-component">
            <Pagination className="MuiPagination-root" count={numberOfPages} onChange={handleChange} page={currentPage}
             showFirstButton showLastButton />
             </div>
        </div>
    );


}




const EquipmentListSearch = () => {
    const user = useContext(UserContext);

    const [destination, setDestination] = useState("");
    const [season, setSeason] = useState("");
    const [category, setCategory] = useState("");
    const [error, setError] = useState(null);
    const [resultsLists, setResultLists] = useState("");
    var equipmentListsResults;

    const [progress, setProgress] = useState(0);

    const useStyles = makeStyles(theme => ({
        option: {
            fontSize: 14,
        },
        selectRoot: {
            textAlign: "left",
        },
    }));

    const classes = useStyles();

    // get default search results- all database
    useEffect(() => {
        async function fetchData() {
            try {
                equipmentListsResults = await searchPublicEquipmentListDocuments(destination, season, category);
                setResultLists(equipmentListsResults);
            }
            catch (error) {
                setError('Error searching public equipment lists');
            }
        }
        function tick() {
            // reset when reaching 100%
            setProgress((oldProgress) => (oldProgress >= 100 ? 0 : oldProgress + 1));
          }
        const timer = setInterval(tick, 20);

        fetchData();

        return () => {
            clearInterval(timer);
          };
    }, []);

    const handleChangeSeason = (event) => {
        setSeason(event.target.value);
    };

    const handleChangeCategory = (event) => {
        setCategory(event.target.value);
    };

    const onChangeHandler = event => {
        const { name, value } = event.currentTarget;
        if (name === "tripDestination") {
            setDestination(value);
        } else if (name === "season") {
            setSeason(value);
        } else if (name === "category") {
            setCategory(value);
        }
    };

    const searchPublicEquipmentListDB = async (event, destination, season, category, setResultLists) => {
        event.preventDefault();
        try {
            equipmentListsResults = await searchPublicEquipmentListDocuments(destination, season, category);
            setResultLists(equipmentListsResults);
        }
        catch (error) {
            setError('Error searching public equipment lists');
        }

        setDestination("");
        setSeason("");
        setCategory("");
    };

    return (
        <ThemeProvider theme={myTheme}>
        <div className="equipmentlistsearch">
            <div className="background">
                <div className="container">
                    <div className="title">
                        Search an Equipment List
                    </div>
                    <div className="formcontainer">
                        <form className="el-search-form"
                            onSubmit={event => {
                                searchPublicEquipmentListDB(event, destination, season, category, setResultLists);
                            }}>
                            <div className="destination-input">
                            <Autocomplete
                            style={{ width: 300 }}
                            inputValue={destination}
                            onInputChange={(event, newDestination) => {
                                setDestination(newDestination);
                            }}
                            options={countries}
                            classes={{
                                option: classes.option,
                            }}
                            autoHighlight
                            getOptionLabel={(option) => option.label}
                            renderOption={(option) => (
                                <>
                                    {option.label}
                                </>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Destination"
                                    variant="outlined"
                                    inputProps={{
                                        ...params.inputProps,
                                        autoComplete: 'new-password', // disable autocomplete and autofill
                                        classes: {
                                            root: classes.outlinedRoot
                                        },
                                    }}
                                />
                            )}
                        />
                            </div>
                            <div className="season-input">
                                <TextField
                            id="outlined-select-season"
                            select
                            label="Season"
                            value={season}
                            style={{ width: 180 }}
                            onChange={handleChangeSeason}
                            variant="outlined"
                            InputProps={{
                                classes: {
                                root: classes.selectRoot,
                                }
                              }}
                        >
                            <MenuItem value=''>
                                All Year Round
                            </MenuItem>
                            <MenuItem value='Summer'>
                                Summer
                            </MenuItem>
                            <MenuItem value='Winter'>
                                Winter
                            </MenuItem>
                            <MenuItem value='Fall'>
                                Fall
                            </MenuItem>
                            <MenuItem value='Spring'>
                                Spring
                            </MenuItem>
                        </TextField>
                            </div>
                            <div className="category-input">
                            <TextField
                            id="outlined-select-category"
                            select
                            label="Category"
                            value={category}
                            style={{ width: 180, paddingTop: 0 }}
                            onChange={handleChangeCategory}
                            variant="outlined"
                            InputProps={{
                                classes: {
                                root: classes.selectRoot,
                                }
                              }}
                        >
                            <MenuItem value=''>
                                All Categories
                            </MenuItem>
                            <MenuItem value='Adventure trip'>
                                Adventure trip
                            </MenuItem>
                            <MenuItem value='City trip'>
                                City trip
                            </MenuItem>
                            <MenuItem value='Relaxing Vacation'>
                                Relaxing Vacation
                            </MenuItem>
                        </TextField>
                            </div>
                            <div>
                                {error}
                            </div>
                            <div>
                                <button
                                    className="el-search-button"
                                    type="submit">
                                    Search</button>
                            </div>
                        </form>
                        <div className="goto-ownlist">
                            Have your own list? Add it <Link className="goto-ownlist-link" to="/privateequipmentlist"> Here </Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="contentcontainer">
                <div className="resultscontainer">
                    <div className="results-title">
                    <h4>Search Results</h4>
                    </div>
                    {resultsLists ? <RenderEquipmentLists lists={resultsLists} user={user} /> 
                    :
                    <Box display="flex" justifyContent="center" alignItems="center" m={1}
     p={1} width={1} height={600} bgcolor="background.paper">
        <CircularProgress variant="determinate" value={progress} />
    </Box> }
                </div>
            </div>
        </div>
        </ThemeProvider>
    );
};

export default EquipmentListSearch;