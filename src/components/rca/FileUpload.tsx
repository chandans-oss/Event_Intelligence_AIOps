import React, { useState } from 'react';
import { Button, Typography, Box, Paper, CircularProgress } from '@mui/material';
import { UploadCloud, FileText } from 'lucide-react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #2a3354', // Changed contrast border
                borderRadius: 4,
                bgcolor: 'background.paper', // explicitly render via theme background
                color: 'text.primary',
                boxShadow: '0 4px 15px -1px rgba(0, 0, 0, 0.4)'
            }}
        >
            <UploadCloud size={60} color="#8b94b0" style={{ marginBottom: 16 }} />
            <Typography variant="h5" fontWeight="semibold" mb={1} color="text.primary">
                Upload Incident Data
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" mb={4} sx={{ maxWidth: 350 }}>
                Upload an Excel file containing incident metrics, events, and syslog data to run the RCA flow.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <input
                    id="file-upload-mui"
                    type="file"
                    accept=".xlsx, .xls"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    disabled={isLoading}
                />
                <label htmlFor="file-upload-mui">
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<FileText size={20} />}
                        disabled={isLoading}
                    >
                        {selectedFile ? selectedFile.name : "Choose File"}
                    </Button>
                </label>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={!selectedFile || isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isLoading ? "Running RCA..." : "Run Analysis"}
                </Button>
            </Box>
        </Paper>
    );
};
