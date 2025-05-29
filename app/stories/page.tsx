import { StoryList } from "@features/stories/story-list";

export default function StoriesPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Stories</h1>
            <StoryList />
        </div>
    );
}
