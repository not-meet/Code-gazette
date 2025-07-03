const Base_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getAllBlogs() {
  console.log('getAllBlogs called at:', new Date().toISOString());
  try {
    const response = await fetch(`${Base_URL}/api/allblogs`, {
      cache: 'force-cache', // Cache the response until manually invalidated
      next: { revalidate: 200 }, // Revalidate every hour (optional)
    });
    if (!response.ok) {
      throw new Error('Failed to fetch blogs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}
