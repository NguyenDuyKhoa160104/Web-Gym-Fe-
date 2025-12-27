import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Package, User, MapPin, FileText, ArrowLeft, SearchX, Clock, Calendar } from 'lucide-react';


const SearchResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { results, query } = location.state || {};

    // Helper to check if any results exist
    const hasResults = results && (
        (results.packages?.total > 0) ||
        (results.rooms?.total > 0) ||
        (results.coaches?.total > 0) ||
        (results.posts?.total > 0)
    );

    // --- SUB-COMPONENTS FOR CARDS ---

    const PackageCard = ({ pkg }) => (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-red-600/50 transition-colors group">
            <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-red-600/10 rounded-lg text-red-500 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <Package size={24} />
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{pkg.durationInDays} ngày</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{pkg.packageName}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">{pkg.description}</p>
            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                <span className="text-red-500 font-bold text-lg">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}</span>
                <button className="text-xs font-bold text-white bg-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-700 uppercase">Chi tiết</button>
            </div>
        </div>
    );

    const CoachCard = ({ coach }) => (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-blue-600/50 transition-colors flex items-center gap-4">
            <img
                src={coach.avatar_url && coach.avatar_url !== 'default-avatar.png' ? coach.avatar_url : "https://ui-avatars.com/api/?name=" + coach.fullname + "&background=random"}
                alt={coach.fullname}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-700"
            />
            <div>
                <h3 className="text-lg font-bold text-white">{coach.fullname}</h3>
                <div className="flex items-center gap-2 text-sm text-blue-400 font-medium mb-1">
                    <User size={14} /> {coach.specialty}
                </div>
                <p className="text-xs text-gray-500">Kinh nghiệm: {coach.experience} năm</p>
            </div>
        </div>
    );

    const RoomCard = ({ room }) => (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-emerald-600/50 transition-colors group">
            <div className="h-32 bg-gray-800 relative">
                {room.image ? (
                    <img src={room.image} alt={room.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <MapPin size={32} />
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                    {room.capacity} người
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-base font-bold text-white mb-1">{room.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{room.description}</p>
            </div>
        </div>
    );

    const PostCard = ({ post }) => (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-0 overflow-hidden hover:border-purple-600/50 transition-colors flex flex-col h-full">
            <div className="h-40 w-full relative shrink-0">
                <img
                    src={post.cover_image_url || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop"}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs text-purple-400 mb-2 font-bold uppercase tracking-wider">
                    <FileText size={12} /> Bài viết
                </div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight hover:text-purple-400 transition-colors cursor-pointer">{post.title}</h3>
                <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center gap-1"><User size={12} /> {post.author?.fullname || 'Admin'}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>
        </div>
    );

    if (!location.state) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <SearchX size={64} className="text-gray-700 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-400 mb-2">Chưa có kết quả tìm kiếm</h2>
                    <p className="text-gray-600 mb-6">Vui lòng sử dụng thanh tìm kiếm ở trên để bắt đầu.</p>
                    <button onClick={() => navigate('/')} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold uppercase text-sm hover:bg-red-700 transition-colors">
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-200 font-sans">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pb-20">

                {/* Header Section */}
                <div className="mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-sm text-gray-500 hover:text-white mb-4 transition-colors group"
                    >
                        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Quay lại
                    </button>

                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic mb-2">
                        Kết quả tìm kiếm cho: <span className="text-red-600">"{query}"</span>
                    </h1>
                    {!hasResults && (
                        <p className="text-gray-400">Rất tiếc, chúng tôi không tìm thấy kết quả nào phù hợp với từ khóa của bạn.</p>
                    )}
                </div>

                {!hasResults ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800 border-dashed">
                        <SearchX size={64} className="text-gray-700 mb-4" />
                        <p className="text-gray-500 font-medium">Thử tìm kiếm với từ khóa khác (ví dụ: "Yoga", "PT", "Gói tập").</p>
                    </div>
                ) : (
                    <div className="space-y-16">

                        {/* 1. PACKAGES RESULTS */}
                        {results.packages?.total > 0 && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-red-600 rounded-lg text-white"><Package size={20} /></div>
                                    <h2 className="text-2xl font-bold text-white uppercase">Gói tập ({results.packages.total})</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {results.packages.results.map(pkg => (
                                        <PackageCard key={pkg._id} pkg={pkg} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 2. COACHES RESULTS */}
                        {results.coaches?.total > 0 && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-600 rounded-lg text-white"><User size={20} /></div>
                                    <h2 className="text-2xl font-bold text-white uppercase">Huấn luyện viên ({results.coaches.total})</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.coaches.results.map(coach => (
                                        <CoachCard key={coach._id} coach={coach} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 3. POSTS RESULTS */}
                        {results.posts?.total > 0 && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-600 rounded-lg text-white"><FileText size={20} /></div>
                                    <h2 className="text-2xl font-bold text-white uppercase">Bài viết ({results.posts.total})</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {results.posts.results.map(post => (
                                        <PostCard key={post._id} post={post} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 4. ROOMS RESULTS */}
                        {results.rooms?.total > 0 && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-emerald-600 rounded-lg text-white"><MapPin size={20} /></div>
                                    <h2 className="text-2xl font-bold text-white uppercase">Phòng tập ({results.rooms.total})</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {results.rooms.results.map(room => (
                                        <RoomCard key={room._id} room={room} />
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                )}
            </main>
        </div>
    );
};

export default SearchResultsPage;