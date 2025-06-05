const Footer = () => {
  return (
    <footer className="flex flex-col md:flex-row gap-8 p-8 justify-between bg-light-footer dark:bg-dark-footer border-t border-light-foreground dark:border-primary/30 w-full text-center max-h-fit transition-all duration-200 ease-in-out">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <img src="/artifex-logo.png" alt="Artifex Labs Logo" className="w-[50px]" />
        <p className="pt-1">All rights reserved © 2025</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="tooltip">
          <div className="tooltip-content">
            <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">
              Join our community Discord server
            </div>
          </div>
          <a
            href="https://discord.gg/MhYP7w8n8p"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary focus:outline-none transition-colors"
          >
            <img src="/discord-logo.png" alt="Discord Logo" className="w-[20px] inline-block mr-2" />
            Discord
          </a>
        </div>

        <div className="tooltip">
          <div className="tooltip-content">
            <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">Follow us for more news</div>
          </div>
          <a
            href="https://x.com/artifex_labs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary focus:outline-none transition-colors"
          >
            <img src="/twitter-logo.png" alt="Twitter Logo" className="w-[20px] inline-block mr-2" />
            Twitter
          </a>
        </div>

        <div className="tooltip">
          <div className="tooltip-content">
            <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">
              Look at reverse djed source code
            </div>
          </div>
          <a
            href="https://github.com/artifex-labs/reverse-djed"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary focus:outline-none transition-colors"
          >
            <img src="/github-logo.png" alt="GitHub Logo" className="w-[20px] inline-block mr-2" />
            GitHub
          </a>
        </div>

        <div className="tooltip">
          <div className="tooltip-content">
            <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">Official djed app</div>
          </div>
          <a
            href="https://djed.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary focus:outline-none transition-colors"
          >
            <img src="/djed.svg" alt="GitHub Logo" className="w-[20px] inline-block mr-2" />
            djed.xyz
          </a>
        </div>

        <div className="tooltip">
          <div className="tooltip-content">
            <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">Service status page</div>
          </div>
          <a
            href="https://status.artifex.finance/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary focus:outline-none transition-colors flex items-center gap-1"
          >
            <i className="fas fa-heartbeat text-red-500"></i>
            <span>Status</span>
          </a>
        </div>

        <div className="tooltip">
          <div className="tooltip-content">
            <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">Terms of Service</div>
          </div>
          <a
            href="/terms"
            className="hover:text-primary focus:outline-none transition-colors flex items-center gap-1"
          >
            <i className="fas fa-file-contract text-primary-500"></i>
            <span>Terms</span>
          </a>
        </div>

        <div className="tooltip">
          <div className="tooltip-content">
            <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">Privacy Policy</div>
          </div>
          <a
            href="/privacy"
            className="hover:text-primary focus:outline-none transition-colors flex items-center gap-1"
          >
            <i className="fas fa-user-secret text-primary-500"></i>
            <span>Privacy</span>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
