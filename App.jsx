import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Calendar, User, Phone, IdCard, CheckCircle2, AlertCircle, Lock, Search } from 'lucide-react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    nationalId: '',
    patientName: '',
    phoneNumber: '',
    appointmentDate: '',
    notes: ''
  })
  
  const [trackingData, setTrackingData] = useState({
    nationalId: '',
    phoneNumber: ''
  })
  
  const [bookings, setBookings] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [currentView, setCurrentView] = useState('form') // 'form', 'admin', or 'tracking'
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [trackedBooking, setTrackedBooking] = useState(null)
  const [trackingError, setTrackingError] = useState('')

  const ADMIN_PASSWORD = '10551055'
  const DEFAULT_REJECTION_REASON = 'أكملت عدد مرات التعبئة أو ليس لديك أمر تعبئة. لابد من زيارة العيادة'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTrackingInputChange = (e) => {
    const { name, value } = e.target
    setTrackingData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAdminLogin = (e) => {
    e.preventDefault()
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true)
      setAdminPassword('')
    } else {
      alert('كلمة المرور غير صحيحة')
      setAdminPassword('')
    }
  }

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false)
    setCurrentView('form')
  }

  const handleTrackBooking = (e) => {
    e.preventDefault()
    setTrackingError('')
    setTrackedBooking(null)

    if (!trackingData.nationalId.trim() || !trackingData.phoneNumber.trim()) {
      setTrackingError('الرجاء إدخال رقم الهوية ورقم الهاتف')
      return
    }

    const booking = bookings.find(
      b => b.nationalId === trackingData.nationalId && b.phoneNumber === trackingData.phoneNumber
    )

    if (booking) {
      setTrackedBooking(booking)
    } else {
      setTrackingError('لم يتم العثور على حجز بهذه البيانات')
    }
  }

  const validateForm = () => {
    if (!formData.nationalId.trim()) {
      setErrorMessage('الرجاء إدخال رقم الهوية')
      return false
    }
    if (formData.nationalId.trim().length !== 10) {
      setErrorMessage('رقم الهوية يجب أن يكون 10 أرقام')
      return false
    }
    if (!formData.patientName.trim()) {
      setErrorMessage('الرجاء إدخال اسم المريض')
      return false
    }
    if (!formData.phoneNumber.trim()) {
      setErrorMessage('الرجاء إدخال رقم الهاتف')
      return false
    }
    if (!formData.appointmentDate) {
      setErrorMessage('الرجاء اختيار تاريخ الموعد')
      return false
    }
    
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowError(false)
    setShowSuccess(false)
    
    if (!validateForm()) {
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return
    }

    const newBooking = {
      id: Date.now(),
      ...formData,
      status: 'pending',
      rejectionReason: '',
      submittedAt: new Date().toISOString()
    }

    setBookings(prev => [...prev, newBooking])
    setShowSuccess(true)
    
    // Reset form
    setFormData({
      nationalId: '',
      patientName: '',
      phoneNumber: '',
      appointmentDate: '',
      notes: ''
    })

    setTimeout(() => setShowSuccess(false), 5000)
  }

  const updateBookingStatus = (id, newStatus, rejectionReason = '') => {
    setBookings(prev => prev.map(booking => 
      booking.id === id ? { ...booking, status: newStatus, rejectionReason } : booking
    ))
  }

  const deleteBooking = (id) => {
    setBookings(prev => prev.filter(booking => booking.id !== id))
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'قيد الانتظار'
      case 'completed': return 'تم الصرف'
      case 'rejected': return 'مرفوض'
      default: return status
    }
  }

  const handleViewChange = (view) => {
    setCurrentView(view)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">نظام حجز مواعيد إعادة صرف الأدوية - مستشفى حوطة بني تميم العام</h1>
          <div className="flex items-center justify-center mb-4">
            <img src="/images/hospital_logo.jpeg" alt="Hospital Logo" className="h-24 w-auto" />
          </div>
          <p className="text-gray-600 text-lg">احجز موعدك مسبقاً لتجهيز أدويتك وتقليل وقت الانتظار</p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <Button 
            onClick={() => handleViewChange('form')}
            variant={currentView === 'form' ? 'default' : 'outline'}
            className="transition-all duration-300"
          >
            نموذج الحجز
          </Button>
          <Button 
            onClick={() => handleViewChange('tracking')}
            variant={currentView === 'tracking' ? 'default' : 'outline'}
            className="transition-all duration-300"
          >
            <Search className="w-4 h-4 ml-2" />
            تتبع الطلب
          </Button>
          <Button 
            onClick={() => handleViewChange('admin')}
            variant={currentView === 'admin' ? 'default' : 'outline'}
            className="transition-all duration-300"
          >
            <Lock className="w-4 h-4 ml-2" />
            لوحة الإدارة ({bookings.length})
          </Button>
          {isAdminAuthenticated && (
            <Button 
              onClick={handleAdminLogout}
              variant="destructive"
              className="transition-all duration-300"
            >
              تسجيل الخروج
            </Button>
          )}
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <p className="text-green-800 font-medium">تم تسجيل موعدك بنجاح! سنقوم بتجهيز أدويتك قبل الموعد.</p>
          </div>
        )}

        {/* Error Message */}
        {showError && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Booking Form View */}
        {currentView === 'form' && (
          <Card className="shadow-xl border-2 animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle className="text-2xl text-right">نموذج حجز الموعد</CardTitle>
              <CardDescription className="text-right">يرجى تعبئة جميع الحقول المطلوبة</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Information */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg text-right flex items-center gap-2">
                    <User className="w-5 h-5" />
                    معلومات المريض
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nationalId" className="text-right block">رقم الهوية الوطنية *</Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="nationalId"
                        name="nationalId"
                        type="text"
                        value={formData.nationalId}
                        onChange={handleInputChange}
                        placeholder="أدخل رقم الهوية (10 أرقام)"
                        className="text-right pl-10"
                        maxLength="10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientName" className="text-right block">اسم المريض *</Label>
                    <Input
                      id="patientName"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      placeholder="أدخل الاسم الكامل"
                      className="text-right"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-right block">رقم الهاتف *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="أدخل رقم الهاتف"
                        className="text-right pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg text-right flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    تفاصيل الموعد
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate" className="text-right block">تاريخ الموعد المطلوب *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="appointmentDate"
                        name="appointmentDate"
                        type="date"
                        value={formData.appointmentDate}
                        onChange={handleInputChange}
                        className="text-right pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-right block">ملاحظات إضافية</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="أي ملاحظات أو معلومات إضافية"
                      className="text-right"
                      rows="4"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full text-lg py-6 transition-all duration-300 hover:scale-105"
                >
                  تسجيل الموعد
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tracking View */}
        {currentView === 'tracking' && (
          <Card className="shadow-xl border-2 animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="text-2xl text-right">تتبع الحجز</CardTitle>
              <CardDescription className="text-right">ابحث عن حالة حجزك باستخدام رقم الهوية ورقم الهاتف</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleTrackBooking} className="space-y-6">
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="trackNationalId" className="text-right block">رقم الهوية الوطنية *</Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="trackNationalId"
                        name="nationalId"
                        type="text"
                        value={trackingData.nationalId}
                        onChange={handleTrackingInputChange}
                        placeholder="أدخل رقم الهوية"
                        className="text-right pl-10"
                        maxLength="10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trackPhoneNumber" className="text-right block">رقم الهاتف *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="trackPhoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={trackingData.phoneNumber}
                        onChange={handleTrackingInputChange}
                        placeholder="أدخل رقم الهاتف"
                        className="text-right pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {trackingError && (
                  <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <p className="text-red-800 font-medium">{trackingError}</p>
                  </div>
                )}

                {trackedBooking && (
                  <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(trackedBooking.status)}`}>
                        {getStatusText(trackedBooking.status)}
                      </span>
                      <h3 className="text-xl font-bold text-gray-800">{trackedBooking.patientName}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-gray-600">{trackedBooking.nationalId}</span>
                        <IdCard className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-gray-600">{trackedBooking.phoneNumber}</span>
                        <Phone className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2 justify-end md:col-span-2">
                        <span className="text-gray-600 font-semibold">{trackedBooking.appointmentDate}</span>
                        <Calendar className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {trackedBooking.notes && (
                      <div className="bg-white p-3 rounded-lg">
                        <p className="font-semibold text-sm mb-1 text-right">ملاحظات:</p>
                        <p className="text-sm text-gray-700 text-right">{trackedBooking.notes}</p>
                      </div>
                    )}

                    {trackedBooking.status === 'rejected' && (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <p className="font-semibold text-sm mb-1 text-right text-red-800">سبب الرفض:</p>
                        <p className="text-sm text-red-700 text-right">{trackedBooking.rejectionReason || DEFAULT_REJECTION_REASON}</p>
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full text-lg py-6 transition-all duration-300 hover:scale-105"
                >
                  <Search className="w-4 h-4 ml-2" />
                  البحث عن الحجز
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Admin Panel View */}
        {currentView === 'admin' && (
          <div className="space-y-6">
            {!isAdminAuthenticated ? (
              <Card className="shadow-xl border-2 animate-fade-in">
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                  <CardTitle className="text-2xl text-right">تسجيل الدخول - لوحة الإدارة</CardTitle>
                  <CardDescription className="text-right">أدخل كلمة المرور للوصول إلى لوحة الإدارة</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword" className="text-right block">كلمة المرور *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <Input
                          id="adminPassword"
                          name="adminPassword"
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="أدخل كلمة المرور"
                          className="text-right pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full text-lg py-6 transition-all duration-300 hover:scale-105"
                    >
                      تسجيل الدخول
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="shadow-xl border-2">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardTitle className="text-2xl text-right">لوحة إدارة الحجوزات</CardTitle>
                    <CardDescription className="text-right">
                      إجمالي الحجوزات: {bookings.length} | 
                      قيد الانتظار: {bookings.filter(b => b.status === 'pending').length} | 
                      تم الصرف: {bookings.filter(b => b.status === 'completed').length}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {bookings.length === 0 ? (
                  <Card className="p-12 text-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">لا توجد حجوزات حالياً</p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {bookings.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)).map(booking => (
                      <Card key={booking.id} className="shadow-lg border-2 hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="flex-1 space-y-3 text-right w-full">
                              <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                                  {getStatusText(booking.status)}
                                </span>
                                <h3 className="text-xl font-bold text-gray-800">{booking.patientName}</h3>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 justify-end">
                                  <span className="text-gray-600">{booking.nationalId}</span>
                                  <IdCard className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                  <span className="text-gray-600">{booking.phoneNumber}</span>
                                  <Phone className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex items-center gap-2 justify-end md:col-span-2">
                                  <span className="text-gray-600 font-semibold">{booking.appointmentDate}</span>
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                </div>
                              </div>

                              {booking.notes && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <p className="font-semibold text-sm mb-1 text-right">ملاحظات:</p>
                                  <p className="text-sm text-gray-700 text-right">{booking.notes}</p>
                                </div>
                              )}

                              {booking.status === 'rejected' && (
                                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                  <p className="font-semibold text-sm mb-1 text-right text-red-800">سبب الرفض:</p>
                                  <p className="text-sm text-red-700 text-right">{booking.rejectionReason || DEFAULT_REJECTION_REASON}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-4 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.id, 'pending')}
                              className="hover:bg-yellow-50"
                            >
                              قيد الانتظار
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              className="hover:bg-green-50"
                            >
                              تم الصرف
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.id, 'rejected', DEFAULT_REJECTION_REASON)}
                              className="hover:bg-red-50 text-red-600"
                            >
                              رفض
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
                                  deleteBooking(booking.id)
                                }
                              }}
                            >
                              حذف
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <footer className="text-center mt-12 text-gray-500 text-sm">
        <p>حقوق الملكية الفكرية &copy; 2025 مستشفى حوطة بني تميم العام</p>
        <p>samoaltamimi@moh.gov.sa</p>
      </footer>
    </div>
  )
}

export default App

