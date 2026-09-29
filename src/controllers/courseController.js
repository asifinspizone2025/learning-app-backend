const axios = require('axios');
const Course = require('../models/Course');

const createCourse = async (req, res) => {
  try {
    const {
      title,
      subject,
      instructorName,
      thumbnailUrl,
      videoSource,
      youtubePlaylistId,
      driveFolderId,
    } = req.body;

    if (!title || !subject || !instructorName || !thumbnailUrl || !videoSource) {
      return res.status(400).json({
        message: 'Title, subject, instructorName, thumbnailUrl and videoSource are required',
      });
    }

    if (videoSource === 'youtube' && !youtubePlaylistId) {
      return res.status(400).json({ message: 'youtubePlaylistId is required for YouTube source' });
    }

    if (videoSource === 'drive' && !driveFolderId) {
      return res.status(400).json({ message: 'driveFolderId is required for Drive source' });
    }

    const course = await Course.create({
      title,
      subject,
      instructorName,
      thumbnailUrl,
      videoSource,
      youtubePlaylistId: videoSource === 'youtube' ? youtubePlaylistId : undefined,
      driveFolderId: videoSource === 'drive' ? driveFolderId : undefined,
    });

    return res.status(201).json(course);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCoursesBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const courses = await Course.find({ subject: subjectId });
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const {
      title,
      instructorName,
      thumbnailUrl,
      videoSource,
      youtubePlaylistId,
      driveFolderId,
    } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (title !== undefined) course.title = title;
    if (instructorName !== undefined) course.instructorName = instructorName;
    if (thumbnailUrl !== undefined) course.thumbnailUrl = thumbnailUrl;
    if (videoSource !== undefined) course.videoSource = videoSource;
    if (youtubePlaylistId !== undefined) course.youtubePlaylistId = youtubePlaylistId;
    if (driveFolderId !== undefined) course.driveFolderId = driveFolderId;

    await course.save();
    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Fetches all video files inside a Drive folder, sorted by name so
// "Lecture 1", "Lecture 2"... come out in the right order naturally.
const getDriveFolderVideos = async (folderId) => {
  const response = await axios.get('https://www.googleapis.com/drive/v3/files', {
    params: {
      q: `'${folderId}' in parents and mimeType contains 'video/' and trashed = false`,
      fields: 'files(id, name, thumbnailLink)',
      orderBy: 'name_natural',
      key: process.env.YOUTUBE_API_KEY,
      pageSize: 200,
    },
  });

  return response.data.files.map((file, index) => ({
    source: 'drive',
    fileId: file.id,
    title: file.name.replace(/\.[^/.]+$/, ''), // strip file extension for display
    thumbnailUrl: file.thumbnailLink || '',
    position: index,
  }));
};

const getCourseVideos = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.videoSource === 'drive') {
      const videos = await getDriveFolderVideos(course.driveFolderId);
      return res.status(200).json(videos);
    }

    // videoSource === 'youtube'
    let nextPageToken = '';
    let position = 0;
    const videos = [];

    do {
      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/playlistItems',
        {
          params: {
            part: 'snippet',
            playlistId: course.youtubePlaylistId,
            maxResults: 50,
            pageToken: nextPageToken,
            key: process.env.YOUTUBE_API_KEY,
          },
        }
      );

      response.data.items.forEach((item) => {
        videos.push({
          source: 'youtube',
          youtubeVideoId: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnailUrl: item.snippet.thumbnails?.medium?.url || '',
          position: position++,
        });
      });

      nextPageToken = response.data.nextPageToken || '';
    } while (nextPageToken);

    return res.status(200).json(videos);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCourse,
  getCoursesBySubject,
  getCourseVideos,
  updateCourse,
  deleteCourse,
};