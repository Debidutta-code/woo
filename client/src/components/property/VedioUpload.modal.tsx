import React, { useState, useRef } from 'react';
import { X, Upload, Video, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import createAxiosInstance from '../axiosInstance';

const uploadToS3 = async (
  file: File,
  onProgress: (p: number) => void
) => {
  const axiosinstance = createAxiosInstance();

  const res = await axiosinstance.post("/upload/generate-url", {
    fileType: file.type,
  });

  const { uploadUrl, fileUrl } = res.data.data;

  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
    onUploadProgress: (e) => {
      const percent = Math.round((e.loaded * 100) / (e.total || 1));
      onProgress(percent);
    },
  });

  return {
    videoUrl: fileUrl,
    thumbnailUrl: null, 
  };
};

const uploadToCloudinary = async (
  file: File,
  cloudName: string,
  uploadPreset: string,
  onProgress: (p: number) => void
): Promise<{ videoUrl: string; thumbnailUrl: string }> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);

        const videoUrl = response.secure_url;
        const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_1/${response.public_id}.jpg`;

        resolve({ videoUrl, thumbnailUrl });
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
    );
    xhr.send(formData);
  });
};


interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (videoUrl: string, thumbnailUrl: string) => void;
  title?: string;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  title = "Upload Video",
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Video file size should not exceed 50MB");
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUploadSuccess(false);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a video file");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const isDev = import.meta.env.VITE_NODE_ENV === "development";

    try {
      let result;

      if (isDev) {
        result = await uploadToCloudinary(
          selectedFile,
          CLOUDINARY_CLOUD_NAME,
          CLOUDINARY_UPLOAD_PRESET,
          setUploadProgress
        );
      } else {
        result = await uploadToS3(selectedFile, setUploadProgress);
      }

      setUploadSuccess(true);
      setIsUploading(false);

      setTimeout(() => {
        onUploadSuccess(
          result.videoUrl,
          result.thumbnailUrl || ""
        );
        handleClose();
      }, 1200);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
      setUploadProgress(0);
      setUploadSuccess(false);
      onClose();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      const event = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    } else {
      setError("Please drop a valid video file");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Upload Area */}
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Video size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your video here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports: MP4, MOV, AVI, WebM (Max 50MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Preview */}
              {previewUrl && (
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    src={previewUrl}
                    controls
                    className="w-full max-h-96"
                    
                  />
                </div>
              )}

              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  {!isUploading && !uploadSuccess && (
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setError(null);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="font-medium text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Message */}
              {uploadSuccess && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                  <CheckCircle size={20} />
                  <span className="font-medium">Video uploaded successfully!</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || uploadSuccess}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Uploading...
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle size={20} />
                Uploaded
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload Video
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
