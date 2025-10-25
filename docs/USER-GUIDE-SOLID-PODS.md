# User Guide: Solid Pods Setup

## Quick Start (3 minutes)

### Option 1: Use Public Provider (Fastest)

1. **Open Dashboard**: http://localhost:5176/solid-dashboard.html
2. **Click Login Tab** → Select "solidcommunity.net"
3. **Create Account** → Follow registration
4. **Done!** Your data is now in your Pod

### Option 2: Self-Host (Recommended for Production)

```bash
# 1. Start Community Solid Server
./scripts/setup-solid-server.sh

# 2. Create account at http://localhost:3000/
# 3. Update custom provider in dashboard to http://localhost:3000/
```

## Features Overview

### 📝 Profile Management
- Edit name, bio, interests
- Upload avatar (auto-resized to 400x400)
- Private data stays in YOUR Pod

### 📚 Bookmarks
- Save articles with title + URL
- Export/Import JSON
- Sync from localStorage

### ⚙️ Settings
- Language, theme, notifications
- RSS feed management
- Auto-sync with Pod

### 🚀 Migration Wizard
1. **Check**: See what data exists in localStorage
2. **Migrate**: Transfer to Pod with backup
3. **Cleanup**: Remove local data (keeps backup)
4. **Done**: All data now in Pod!

## FAQ

**Q: Which provider should I use?**
A: For testing → solidcommunity.net. For production → self-host Community Solid Server.

**Q: Is my data secure?**
A: Yes! Data is stored in YOUR Pod, encrypted via HTTPS. You control access.

**Q: Can I switch providers?**
A: Yes! Export your data, create new Pod, import data.

**Q: What happens if I'm offline?**
A: Changes queue automatically, sync when back online.

**Q: Where is my data stored?**
A: In RDF/Turtle format at `https://your-pod-url/toplocs/` folder.

## Troubleshooting

### Login fails
- Check provider URL is correct
- Ensure HTTPS (not HTTP)
- Clear browser cache

### Data not syncing
- Check online status (top-right indicator)
- Click "Reload" button
- Check Pod permissions

### Migration failed
- Restore from backup (automatically created)
- Check console for errors
- Contact support

## Support

- **Docs**: https://github.com/toplocs/news-plugin
- **Issues**: https://github.com/toplocs/news-plugin/issues
- **Community**: https://toplocs.org/community
