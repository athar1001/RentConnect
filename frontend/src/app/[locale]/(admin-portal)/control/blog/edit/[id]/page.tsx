'use client';

import BlogForm from '../../BlogForm';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminBlogEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const res = await fetch(`http://localhost:3000/blog/control/${id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setPost(data);
        } else {
          toast.error('Failed to load article details');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch article details');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
        <span className="text-sm text-slate-500">Loading article data...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-24 text-center">
        <span className="text-sm text-red-500 font-bold">Article not found</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-1">
      <BlogForm initialData={post} isEdit={true} />
    </div>
  );
}
