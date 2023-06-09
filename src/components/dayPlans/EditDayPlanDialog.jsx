import * as React from 'react';
import { useState } from "react";
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import { IconButton } from '@mui/material';
import { MenuItem } from '@mui/material';
import { Button } from '@mui/material';
import { CircularProgress } from '@mui/material';
import { Dialog } from '@mui/material';
import { DialogActions } from '@mui/material';
import { DialogContent } from '@mui/material';
import { DialogContentText } from '@mui/material';
import { DialogTitle } from '@mui/material';
import { TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import isValid from 'date-fns/isValid';
import isBefore from 'date-fns/isBefore';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import ChurchIcon from '@mui/icons-material/Church';
import CloseIcon from '@mui/icons-material/Close';
import CastleIcon from '@mui/icons-material/Castle';
import SailingIcon from '@mui/icons-material/Sailing';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import WaterIcon from '@mui/icons-material/Water';
import LandscapeIcon from '@mui/icons-material/Landscape';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DownhillSkiingIcon from '@mui/icons-material/DownhillSkiing';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { SuccessToast } from '../toasts/SuccessToast';
import { ErrorToast } from '../toasts/ErrorToast';
import { doPatch } from "../../components/utils/fetch-utils";
import { TextFieldsTwoTone } from '@mui/icons-material';


const icons = [
    {
        id: 0,
        value: 0,
        icon: <ChurchIcon sx={{ color: "primary.main" }} />
    },
    {
        id: 1,
        value: 1,
        icon: <DirectionsWalkIcon sx={{ color: "primary.main" }} />
    },
    {
        id: 2,
        value: 2,
        icon: <LocationCityIcon sx={{ color: "primary.main" }} />
    },
    {
        id: 3,
        value: 3,
        icon: <LandscapeIcon sx={{ color: "primary.main" }} />
    },
    {
        id: 4,
        value: 4,
        icon: <RestaurantIcon sx={{ color: "primary.main" }} />
    },
    {
        id: 5,
        value: 5,
        icon: <CastleIcon sx={{ color: "primary.main" }} />
    },
    {
        id: 6,
        value: 6,
        icon: <SailingIcon sx={{ color: "primary.main" }} />
    },
    {
        id: 7,
        value: 7,
        icon: <WaterIcon sx={{ color: "primary.main" }} />
    },
    {
        id: 8,
        value: 8,
        icon: <DownhillSkiingIcon sx={{ color: "primary.main" }} />
    },
];

export const EditDayPlanDialog = ({ open, onClose, dayPlanData, onSuccess }) => {

    const { groupId } = useParams();

    const today = new Date();
    //do przywrócenia
    const initialDate = parseISO(dayPlanData.date);
    // const initialDate = new Date();
    const [isEditing, setIsEditing] = useState(false);
    const [successToastOpen, setSuccessToastOpen] = useState(false);
    const [errorToastOpen, setErrorToastOpen] = useState(false);

    const dayPlanNameLength = dayPlanData.name.length;
    const [dayPlanName, setDayPlanName] = useState({ value: dayPlanData.name, length: dayPlanNameLength });
    const [dayPlanNameError, setDayPlanNameError] = useState("You have to provide day plan name.");
    const [editionError, setEditionError] = useState("Ups! Something went wrong. Try again.");

    const [date, setDate] = useState(initialDate);
    const [dateError, setDateError] = useState("You have to provide date.")

    const defaultInputValues = {
        dayPlanName: dayPlanName,
        date: initialDate,
        icon: dayPlanData.iconType,
    };

    const [values, setValues] = useState(defaultInputValues);

    const onKeyDown = (e) => {
        e.preventDefault();
    };

    const onDayPlanNameChange = (value) => {
        setDayPlanNameError(
            value.length === 0 ? "You have to provide day plan name." : null
        )
        setDayPlanNameError(
            value.length > 99 ? "Day plan name too long, max. 100 characters" : null
        )
        setDayPlanName({ value: value, length: value.length });
    };

    const onDateChange = (value) => {
        console.log(value)
        if (!isValid(value)) {
            setDateError("You have to provide valid date.");
            setDate(initialDate);
            return;
        }

        setDateError(
            isBefore(value, today) ? "Date cannot be earlier than current day." : null
        )
        setDate(value);
    };

    const validationSchema = Yup.object().shape({
        dayPlanName: Yup
            .string()
            .required("You have to provide day pllan name")
            .max(100, "Day plan name too long, max. 100 characters"),
        date: Yup
            .date()
            .required("You have to provide date")
            .typeError("Invalid date.")
    });

    const { register, handleSubmit, reset, formState: { errors }, control } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const handleChange = (value) => {
        setValues(value);
        console.log(values);
    };

    const handleEditDayPlan = async (values) => {
        setIsEditing(true);
        var postBody = { 'groupId': groupId, 'name': values.dayPlanName, 'date': format(new Date(Date.parse(values.date)), "yyyy-MM-dd"), 'iconType': values.icon };
        await doPatch('/api/v1/day-plan?dayPlanId=' + dayPlanData.dayPlanId, postBody)
            .then(response => {
                setSuccessToastOpen(response.ok);
                setIsEditing(false);
                close();
                onSuccess();
            })
            .catch(err => {
                setIsEditing(false);
                setErrorToastOpen(true);
                setEditionError(err.message)
            });
    };

    const close = () => {
        reset();
        setDate(initialDate);
        onClose();
    };

    return (
        <div>
            <SuccessToast open={successToastOpen} onClose={() => setSuccessToastOpen(false)} message="Day plan successfully edited." />
            <ErrorToast open={errorToastOpen} onClose={() => setErrorToastOpen(false)} message={editionError} />

            <Dialog
                open={open}
                onClose={onClose}
                aria-labelledby="responsive-dialog-title"
                PaperProps={{
                    style: {
                        minWidth: "400px",
                        maxWidth: "400px",
                        borderRadius: "20px"
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        backgroundColor: "primary.main",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        color: "#FFFFFF",
                        mb: 2
                    }}
                >
                    <Typography sx={{ color: "#FFFFFF", fontSize: "24px" }}>
                        Edit day plan
                    </Typography>
                    <IconButton
                        sx={{ p: 0 }}
                        onClick={onClose}
                    >
                        <CloseIcon sx={{ color: "secondary.main", fontSize: "32px" }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <form
                        onSubmit={handleSubmit(handleEditDayPlan)}
                    >
                        <TextField
                            type='string'
                            autoFocus
                            margin="normal"
                            placeholder='Day plan name'
                            name='day plan name'
                            label='Day plan name'
                            fullWidth
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EditIcon sx={{ color: "primary.main" }} />
                                    </InputAdornment>
                                ),
                            }}
                            {...register('dayPlanName')}
                            error={Boolean(errors.dayPlanName) ? (Boolean(dayPlanNameError)) : false}
                            helperText={Boolean(errors.dayPlanName) && dayPlanNameError}
                            value={dayPlanName.value}
                            onChange={(event) =>
                                onDayPlanNameChange(event.target.value)
                            }
                        />
                        <Box sx={{ display: "flex", flexDirection: "column", minWidth: "200px", width: "200px" }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <Controller
                                    name={"date"}
                                    control={control}
                                    sx={{ mb: 1 }}
                                    render={({ field: { onChange, value } }) =>
                                        <DatePicker
                                            disablePast
                                            label="Date"
                                            sx={{
                                                svg: { color: "#2ab7ca" },
                                                mt: 1,
                                                mb: 1,
                                                width: "50%",
                                                minWidth: "200px"
                                            }}
                                            // renderInput={(params) =>
                                            //     <TextField
                                            //         {...params}
                                            //         onKeyDown={onKeyDown}
                                            //         error={!!errors.date}
                                            //         helperText={errors.date?.message}
                                            //     />
                                            // }
                                            onKeyDown={onKeyDown}
                                            error={!!errors.date}
                                            helperText={errors.date?.message}
                                            defaultValue={values.date}
                                            onChange={(date) => {
                                                onChange(date);
                                            }}
                                        />
                                    }
                                />

                                {/* <DatePicker
                                    disablePast
                                    onChange={(newDate) => {
                                        handleChange({ ...values, date: newDate });
                                    }}
                                    value={values.date}
                                    label="Date"
                                    sx={{
                                        svg: { color: "#2ab7ca" },
                                        my: 2
                                    }}
                                    renderInput={(params) =>
                                        <TextField
                                            {...params}
                                            // sx={{
                                            //     svg: { color: "#2ab7ca" },
                                            //     mb: "24px"
                                            // }}
                                            onKeyDown={onKeyDown}
                                            label="Date"
                                            type="date"
                                            margin="normal"
                                            value={values.date}
                                            {...register('date')}
                                            error={Boolean(errors.date) ? (Boolean(dateError)) : false}
                                            helperText={Boolean(errors.date) && dateError}
                                            onChange={(event) => {
                                                handleChange({ ...values, date: event.target.value });
                                            }}
                                        />
                                    }
                                /> */}
                            </LocalizationProvider>
                        </Box>
                        <DialogContentText variant="body1" sx={{ mt: 1, mb: -1 }}>
                            Icon:
                        </DialogContentText>
                        <Box>
                            <TextField
                                sx={{ minWidth: "60px", width: "60px" }}
                                select
                                margin="normal"
                                name='icon'
                                variant="outlined"
                                SelectProps={{
                                    IconComponent: () => null,
                                    autoWidth: true
                                }}
                                {...register('icon')}
                                error={errors.icon ? true : false}
                                helperText={errors.icon?.message}
                                defaultValue={dayPlanData.iconType}
                                onChange={(event) => { handleChange({ ...values, icon: event.target.value }) }}
                            >
                                {icons.map((icon) => (
                                    <MenuItem key={icon.id} value={icon.value} sx={{ px: 2, py: 1 }} >
                                        <Box sx={{ px: 0 }}>
                                            {icon.icon}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <DialogActions>
                            {isEditing ?
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ borderRadius: "20px", color: "#FFFFFF", width: "100px" }}
                                >
                                    <CircularProgress size="24px" sx={{ color: "#FFFFFF" }} />
                                </Button>
                                :
                                <>
                                    <Button
                                        variant="outlined"
                                        sx={{ borderRadius: "20px" }}
                                        onClick={() => close()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        sx={{ borderRadius: "20px", color: "#FFFFFF", width: "100px" }}
                                    >
                                        Edit
                                    </Button>
                                </>
                            }

                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog >
        </div >
    );
};