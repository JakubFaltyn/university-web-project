import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Story from '@/lib/models/Story';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    // Filter by project if projectId is provided
    const filter = projectId ? { projectId } : {};
    const stories = await Story.find(filter);
    
    // Convert MongoDB documents to our format
    const formattedStories = stories.map(story => ({
      id: story._id.toString(),
      name: story.name,
      description: story.description,
      priority: story.priority,
      projectId: story.projectId.toString(),
      createdAt: story.createdAt,
      status: story.status,
      ownerId: story.ownerId.toString(),
    }));
    
    return NextResponse.json(formattedStories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Add createdAt timestamp
    const storyData = {
      ...body,
      createdAt: new Date().toISOString(),
    };
    
    const story = new Story(storyData);
    await story.save();
    
    // Convert to our format
    const formattedStory = {
      id: story._id.toString(),
      name: story.name,
      description: story.description,
      priority: story.priority,
      projectId: story.projectId.toString(),
      createdAt: story.createdAt,
      status: story.status,
      ownerId: story.ownerId.toString(),
    };
    
    return NextResponse.json(formattedStory, { status: 201 });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
} 