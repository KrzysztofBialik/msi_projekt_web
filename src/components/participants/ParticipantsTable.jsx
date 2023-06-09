import * as React from 'react';
import { useState } from "react";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import StarIcon from '@mui/icons-material/Star';
import { GridToolbarContainer } from '@mui/x-data-grid';
import { GridToolbarColumnsButton } from '@mui/x-data-grid';
import { GridToolbarFilterButton } from '@mui/x-data-grid';
import { GridToolbarDensitySelector, } from '@mui/x-data-grid';
import { RemoveParticipantDialog } from './RemoveParticipantDialog';
import { PromoteParticipantDialog } from './PromoteParticipantDialog';
import { ParticipantsAvailabilityDialog } from '../availability/ParticipantsAvailabilityDialog';
import { doGet } from "../../components/utils/fetch-utils";

// const participants = [
//     {
//         userId: 1,
//         firstName: "Krzysztof",
//         surname: "Bialik",
//         phoneNumber: "123456789",
//         email: "254573@student.pwr.edu.pl",
//         role: "COORDINATOR"
//     },
//     {
//         userId: 2,
//         firstName: "Krzysztof",
//         surname: "Bialik",
//         phoneNumber: "123456789",
//         email: "254573@student.pwr.edu.pl",
//         role: "PARTICIPANT"
//     }
// ]

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
        </GridToolbarContainer>
    );
};

export const ParticipantsTable = ({ groupStage, isCoordinator, groupId }) => {

    const navigate = useNavigate();
    const [usersData, setUsersData] = useState([]);
    const [groupCoordinators, setGroupCoordinators] = useState([]);
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
    const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
    const [participantsAvailabilityDialogOpen, setParticipantsAvailabilityDialogOpen] = useState(false);
    const [userId, setUserId] = useState("");
    const [isDeletingHimself, setIsDeletingHimself] = useState(false);
    const [availabilities, setAvailabilities] = useState([]);
    const [usersAvailability, setUsersAvailability] = useState([]);
    const [userFullName, setUserFullName] = useState("");

    const getUsersData = async () => {
        await doGet('/api/v1/user-group/participants?' + new URLSearchParams({ groupId: groupId }).toString())
            .then(response => response.json())
            .then(response => setUsersData(response))
            .catch(err => console.log('Request Failed', err));

        await doGet('/api/v1/user-group/coordinators?' + new URLSearchParams({ groupId: groupId }).toString())
            .then(response => response.json())
            .then(response => setGroupCoordinators(response))
            .catch(err => console.log('Request Failed', err));
    };

    const getAvailabilities = async () => {
        await doGet('/api/v1/availability/group/' + groupId)
            .then(response => response.json())
            .then(response => {
                setAvailabilities(response);
            })
            .catch(err => console.log('Request Failed', err));
    };

    useEffect(() => {
        // setUsersData(participants);
        getUsersData();
        getAvailabilities();
    }, []);

    const removeAction = (userId) => {
        if (userId === parseInt(sessionStorage.getItem("userId"))) {
            setIsDeletingHimself(true);
        }
        else {
            setIsDeletingHimself(false);
        }
        setUserId(userId);
        setRemoveDialogOpen(true);
    };

    const promoteAction = (userId) => {
        setUserId(userId);
        setPromoteDialogOpen(true);
    };

    const checkParticipantsAvailability = (userAvailability, userFullName) => {
        setUserFullName(userFullName);
        setUsersAvailability(userAvailability);
        setParticipantsAvailabilityDialogOpen(true);
    };

    const participantColumn = [
        {
            field: 'firstName', headerName: 'FirstName', renderHeader: () => (
                <strong>
                    First Name
                </strong>
            ), type: 'string', flex: 2, hideable: true, headerAlign: 'center', align: 'left', minWidth: 200
        },
        {
            field: 'surname', headerName: 'Surname', renderHeader: () => (
                <strong>
                    Surname
                </strong>
            ), type: 'string', flex: 2, hideable: true, headerAlign: 'center', align: 'left', minWidth: 200,
        },
        {
            field: 'phoneNumber', headerName: 'Phone Number', renderHeader: () => (
                <strong>
                    Phone Number
                </strong>
            ), type: 'string', flex: 1, hideable: true, headerAlign: 'center', align: 'left', minWidth: 200,
        },
        {

            field: 'email', headerName: 'Mail', renderHeader: () => (
                <strong>
                    Mail
                </strong>
            ), type: 'string', flex: 2, hideable: true, headerAlign: 'center', align: 'left', minWidth: 250,
        },
        {
            field: 'role', headerName: 'Role', renderHeader: () => (
                <strong>
                    Role
                </strong>
            ), type: 'string', flex: 1, hideable: true, headerAlign: 'center', align: 'left', minWidth: 100,
        },
        {
            field: 'actions', headerName: 'Actions', renderHeader: () => (
                <strong>
                    Actions
                </strong>
            ), type: 'actions', flex: 1, hideable: true, headerAlign: 'center', minWidth: 100,
            getActions: (params) => {
                const fullName = `${params.row.firstName} ${params.row.surname}`;
                const userId = params.row.userId;
                const role = params.row.role;
                const isSameUser = userId === parseInt(sessionStorage.getItem("userId"))
                const userAvailability = availabilities[userId];
                if (isCoordinator) {
                    if (groupStage === "PLANNING_STAGE") {
                        if (role === "PARTICIPANT") {
                            return [
                                <GridActionsCellItem
                                    icon={<StarIcon sx={{ color: "secondary.main" }} />}
                                    label="Promote to coordinator"
                                    sx={{ color: "primary.main" }}
                                    onClick={() => promoteAction(userId)}
                                    showInMenu
                                />,
                                <GridActionsCellItem
                                    icon={<EventAvailableIcon sx={{ color: "primary.main" }} />}
                                    label="Check availability"
                                    sx={{ color: "primary.main" }}
                                    onClick={() => checkParticipantsAvailability(userAvailability, fullName)}
                                    showInMenu
                                />,

                                <GridActionsCellItem
                                    icon={<PersonRemoveIcon sx={{ color: "error.main" }} />}
                                    label="Remove from group"
                                    sx={{ color: "error.main" }}
                                    onClick={() => removeAction(userId)}
                                    showInMenu
                                />
                            ];
                        }
                        else if (role === "COORDINATOR" && !isSameUser) {
                            return [
                                <GridActionsCellItem
                                    icon={<EventAvailableIcon sx={{ color: "primary.main" }} />}
                                    label="Check availability"
                                    sx={{ color: "primary.main" }}
                                    onClick={() => checkParticipantsAvailability(userAvailability, fullName)}
                                    showInMenu
                                />,
                                <GridActionsCellItem
                                    icon={<PersonRemoveIcon sx={{ color: "error.main" }} />}
                                    label="Remove from group"
                                    sx={{ color: "error.main" }}
                                    onClick={() => removeAction(userId)}
                                    color={"error.main"}
                                    showInMenu
                                />
                            ];

                        }
                        else if (role === "COORDINATOR" && isSameUser) {
                            return [
                                <GridActionsCellItem
                                    icon={<EventAvailableIcon sx={{ color: "primary.main" }} />}
                                    label="Check availability"
                                    sx={{ color: "primary.main" }}
                                    onClick={() => checkParticipantsAvailability(userAvailability, fullName)}
                                    showInMenu
                                />,
                                <GridActionsCellItem
                                    icon={<DirectionsWalkIcon sx={{ color: "error.main" }} />}
                                    label="Leave group"
                                    sx={{ color: "error.main" }}
                                    onClick={() => removeAction(userId)}
                                    showInMenu
                                />
                            ];
                        }
                    }
                    else {
                        if (role === "COORDINATOR") {
                            return [
                                <GridActionsCellItem
                                    icon={<CurrencyExchangeIcon sx={{ color: "primary.main" }} />}
                                    label="Check expenses"
                                    sx={{ color: "primary.main" }}
                                    onClick={() => { navigate("/finances/" + groupId) }}
                                    showInMenu
                                />
                            ];
                        }

                        else {
                            return [
                                <GridActionsCellItem
                                    icon={<CurrencyExchangeIcon sx={{ color: "primary.main" }} />}
                                    label="Check expenses"
                                    sx={{ color: "primary.main" }}
                                    onClick={() => { navigate("/finances/" + groupId) }}
                                    showInMenu
                                />,
                                <GridActionsCellItem
                                    icon={<StarIcon sx={{ color: "secondary.main" }} />}
                                    label="Promote to coordinator"
                                    sx={{ color: "primary.main" }}
                                    onClick={() => promoteAction(userId)}
                                    showInMenu
                                />
                            ];
                        }
                    }
                }
                else {
                    if (groupStage === "PLANNING_STAGE") {
                        return [
                            <GridActionsCellItem
                                icon={<EventAvailableIcon sx={{ color: "primary.main" }} />}
                                label="Check availability"
                                onClick={() => checkParticipantsAvailability(userAvailability, fullName)}
                                showInMenu
                            />
                        ];
                    }
                    else {
                        return [
                            <GridActionsCellItem
                                icon={<CurrencyExchangeIcon sx={{ color: "primary.main" }} />}
                                label="Check expenses"
                                sx={{ color: "primary.main" }}
                                onClick={() => { navigate("/finances/" + groupId) }}
                                showInMenu
                            />
                        ];
                    }
                }
            },
        },
    ];

    var userFullData = []
    const userWithRoles = () => {
        for (var i = 0; i < usersData.length; i++) {
            var user = {}
            let userId = usersData[i].userId;
            let firstName = usersData[i].firstName;
            let surname = usersData[i].surname;
            let phoneNumber = usersData[i].phoneNumber;
            let email = usersData[i].email;
            // let role = usersData[i].role;


            let role;
            // zakomentowane na etap api
            if (groupCoordinators.some(coordinator => coordinator.userId === usersData[i].userId)) {
                role = "COORDINATOR"
            }
            else {
                role = "PARTICIPANT";
            }
            user['userId'] = userId;
            user['firstName'] = firstName;
            user['surname'] = surname;
            user['phoneNumber'] = phoneNumber;
            user['email'] = email;
            user['role'] = role;
            userFullData.push(user);
        }
    };

    userWithRoles();
    return (
        <>
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                }}
            >
                <RemoveParticipantDialog
                    open={removeDialogOpen}
                    onClose={() => { setRemoveDialogOpen(false) }}
                    groupId={groupId}
                    userId={userId}
                    isDeletingHimself={isDeletingHimself}
                    onSuccess={() => getUsersData()}
                // onSuccess={() => setUsersData(participants)}
                />
                <PromoteParticipantDialog
                    open={promoteDialogOpen}
                    onClose={() => { setPromoteDialogOpen(false) }}
                    groupId={groupId}
                    userId={userId}
                    onSuccess={() => getUsersData()}
                // onSuccess={() => setUsersData(participants)}

                />
                <ParticipantsAvailabilityDialog
                    open={participantsAvailabilityDialogOpen}
                    onClose={() => { setParticipantsAvailabilityDialogOpen(false); setUsersAvailability([]); }}
                    usersAvailability={usersAvailability}
                    userFullName={userFullName}
                />
                <DataGrid
                    sx={{
                        mb: "100px",
                        boxShadow: 5,
                        px: 2,
                        '& .MuiDataGrid-cell:hover': {
                            color: 'primary.main',
                        },
                        [`& .${gridClasses.cell}`]: {
                            py: 1,
                        },
                    }}
                    getRowHeight={() => 'auto'}
                    autoHeight
                    columns={participantColumn}
                    rows={userFullData}
                    getRowId={row => row.userId}
                    hideFooter
                    components={{
                        Toolbar: CustomToolbar,
                    }}
                    loading={!userFullData.length}
                />
            </Box>
        </>
    );
};
