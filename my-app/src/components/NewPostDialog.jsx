import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";

export default function NewPostDialog({ open, onOpenChange, newPostContent, setNewPostContent, addNewPost }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="What's on your mind?"
          value={newPostContent}
          onChange={e => setNewPostContent(e.target.value)}
          className="min-h-[100px]"
        />
        <Button onClick={() => addNewPost(newPostContent)}>Post</Button>
      </DialogContent>
    </Dialog>
  );
}
