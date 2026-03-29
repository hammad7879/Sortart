const currentYear = new Date().getFullYear()

export default function SiteFooter() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME?.trim() || 'ArtWise'

  return (
    <footer
      className="
        mt-auto border-t border-brown-100 bg-beige/90 backdrop-blur-sm
        text-center text-sm text-brown-500
        py-8 px-4
        md:ml-[200px] md:px-6
        lg:ml-[260px] lg:px-8
      "
    >
      <p className="text-brown-700 font-medium mb-1">
        Made by Baseer Ur Rehman and Hamad Riyaz
      </p>
      <p className="text-muted leading-relaxed max-w-xl mx-auto">
        © {currentYear} {siteName}. All rights reserved.
      </p>
    </footer>
  )
}
